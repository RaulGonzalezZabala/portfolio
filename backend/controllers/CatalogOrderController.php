<?php

declare(strict_types=1);

const CATALOG_MAX_DISTINCT_ITEMS = 20;
const CATALOG_MAX_ITEM_QUANTITY = 10;

function checkoutCatalogOrder(PDO $authConnection, PDO $catalogConnection, array $config): never
{
    $user = requireAuthenticatedUser($authConnection);
    requireCsrfToken();

    $payload = readJsonBody();
    $requestedItems = validateCheckoutItems($payload['items'] ?? null);
    $shipping = validateShippingDetails($payload['shipping'] ?? null);

    // Los precios se leen siempre de la base de datos; el cliente solo indica qué y cuántos.
    $products = findPublishedCatalogProductsBySlugs($catalogConnection, array_keys($requestedItems));

    if (count($products) !== count($requestedItems)) {
        sendError(422, 'invalid_products', 'Alguno de los productos de la cesta ya no está disponible.');
    }

    $items = [];
    $totalCents = 0;

    foreach ($requestedItems as $slug => $quantity) {
        $items[] = [...$products[$slug], 'quantity' => $quantity];
        $totalCents += $products[$slug]['priceCents'] * $quantity;
    }

    ensureStripeTestConfiguration($config['stripe']);

    $orderId = generateTicketEventId();
    createCatalogOrder($catalogConnection, $orderId, $user['id'], $shipping, $items, $totalCents);

    $session = createStripeCheckoutSession(
        $config['stripe'],
        $config['frontendBaseUrl'],
        $orderId,
        (string) ($user['email'] ?? ''),
        $items,
    );

    attachStripeSessionToCatalogOrder($catalogConnection, $orderId, (string) $session['id']);

    sendJson(201, ['data' => ['orderId' => $orderId, 'checkoutUrl' => $session['url']]]);
}

function confirmCatalogOrder(PDO $authConnection, PDO $catalogConnection, array $config, string $orderId): never
{
    $user = requireAuthenticatedUser($authConnection);
    requireCsrfToken();

    $order = findCatalogOrderForUser($catalogConnection, $orderId, $user['id']);

    if ($order === null) {
        sendError(404, 'order_not_found', 'El pedido solicitado no existe.');
    }

    if ($order['status'] === 'pending' && $order['stripe_session_id'] !== null) {
        $session = retrieveStripeCheckoutSession($config['stripe'], $order['stripe_session_id']);

        if (($session['payment_status'] ?? '') === 'paid' && ($session['client_reference_id'] ?? '') === $orderId) {
            markCatalogOrderPaidByStripeSession(
                $catalogConnection,
                $order['stripe_session_id'],
                is_string($session['payment_intent'] ?? null) ? $session['payment_intent'] : null,
            );
            $order = findCatalogOrderForUser($catalogConnection, $orderId, $user['id']);
        }
    }

    sendJson(200, ['data' => ['orderId' => $orderId, 'status' => $order['status']]]);
}

function listCatalogOrders(PDO $authConnection, PDO $catalogConnection): never
{
    $user = requireAuthenticatedUser($authConnection);

    sendJson(200, ['data' => findCatalogOrdersForUser($catalogConnection, $user['id'])]);
}

function showCatalogInvoice(PDO $authConnection, PDO $catalogConnection, string $orderId): never
{
    $user = requireAuthenticatedUser($authConnection);
    $invoice = findPaidCatalogInvoiceForUser($catalogConnection, $orderId, $user['id']);

    if ($invoice === null) {
        sendError(404, 'invoice_not_found', 'No se ha encontrado una factura de prueba para este pedido.');
    }

    header('Cache-Control: no-store');
    sendJson(200, ['data' => $invoice]);
}

function receiveStripeWebhook(PDO $catalogConnection, array $config): never
{
    $payload = (string) file_get_contents('php://input');
    $signature = (string) ($_SERVER['HTTP_STRIPE_SIGNATURE'] ?? '');

    if (!isValidStripeWebhookSignature($payload, $signature, $config['stripe']['webhookSecret'])) {
        sendError(400, 'invalid_signature', 'La firma del webhook no es válida.');
    }

    $event = json_decode($payload, true);
    $session = $event['data']['object'] ?? null;

    if (
        is_array($event)
        && in_array($event['type'] ?? '', ['checkout.session.completed', 'checkout.session.async_payment_succeeded'], true)
        && is_array($session)
        && ($session['payment_status'] ?? '') === 'paid'
        && is_string($session['id'] ?? null)
    ) {
        markCatalogOrderPaidByStripeSession(
            $catalogConnection,
            $session['id'],
            is_string($session['payment_intent'] ?? null) ? $session['payment_intent'] : null,
        );
    }

    sendJson(200, ['received' => true]);
}

function validateCheckoutItems(mixed $items): array
{
    if (!is_array($items) || $items === [] || count($items) > CATALOG_MAX_DISTINCT_ITEMS) {
        sendError(422, 'invalid_items', 'La cesta debe contener entre 1 y 20 productos distintos.');
    }

    $quantities = [];

    foreach ($items as $item) {
        $slug = is_array($item) ? ($item['id'] ?? null) : null;
        $quantity = is_array($item) ? ($item['quantity'] ?? null) : null;

        if (
            !is_string($slug)
            || preg_match('/^[a-z0-9]+(?:-[a-z0-9]+)*$/', $slug) !== 1
            || !is_int($quantity)
            || $quantity < 1
            || $quantity > CATALOG_MAX_ITEM_QUANTITY
        ) {
            sendError(422, 'invalid_items', 'Hay productos o cantidades no válidos en la cesta.');
        }

        $quantities[$slug] = min(($quantities[$slug] ?? 0) + $quantity, CATALOG_MAX_ITEM_QUANTITY);
    }

    return $quantities;
}

function validateShippingDetails(mixed $shipping): array
{
    if (!is_array($shipping)) {
        sendError(422, 'invalid_shipping', 'Faltan los datos de envío.');
    }

    $details = [
        'name' => trim((string) ($shipping['name'] ?? '')),
        'phone' => trim((string) ($shipping['phone'] ?? '')),
        'address' => trim((string) ($shipping['address'] ?? '')),
        'city' => trim((string) ($shipping['city'] ?? '')),
        'postalCode' => trim((string) ($shipping['postalCode'] ?? '')),
    ];

    if (mb_strlen($details['name']) < 2 || mb_strlen($details['name']) > 160) {
        sendError(422, 'invalid_name', 'El nombre es obligatorio y no puede superar 160 caracteres.');
    }

    if ($details['phone'] !== '' && preg_match('/^[0-9+() -]{6,30}$/', $details['phone']) !== 1) {
        sendError(422, 'invalid_phone', 'El teléfono no tiene un formato válido.');
    }

    if (mb_strlen($details['address']) < 5 || mb_strlen($details['address']) > 255) {
        sendError(422, 'invalid_address', 'La dirección es obligatoria y no puede superar 255 caracteres.');
    }

    if (mb_strlen($details['city']) < 2 || mb_strlen($details['city']) > 120) {
        sendError(422, 'invalid_city', 'La localidad es obligatoria y no puede superar 120 caracteres.');
    }

    if (preg_match('/^[A-Za-z0-9 -]{3,12}$/', $details['postalCode']) !== 1) {
        sendError(422, 'invalid_postal_code', 'El código postal no es válido.');
    }

    return $details;
}
