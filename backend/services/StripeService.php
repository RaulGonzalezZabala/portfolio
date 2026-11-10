<?php

declare(strict_types=1);

const STRIPE_API_BASE_URL = 'https://api.stripe.com/v1';

function ensureStripeTestConfiguration(array $stripeConfig): void
{
    $secretKey = $stripeConfig['secretKey'];

    // Este proyecto es una demo ficticia: solo se admiten claves del modo de pruebas.
    if (preg_match('/^(sk|rk)_test_/', $secretKey) !== 1) {
        sendError(503, 'payments_not_configured', 'Los pagos de prueba no están configurados en el servidor.');
    }
}

function stripeRequest(array $stripeConfig, string $method, string $path, array $params = [], ?string $idempotencyKey = null): array
{
    ensureStripeTestConfiguration($stripeConfig);

    $request = curl_init(STRIPE_API_BASE_URL . $path);

    if ($request === false) {
        throw new RuntimeException('No se pudo inicializar el cliente de pagos.');
    }

    $headers = ['Authorization: Bearer ' . $stripeConfig['secretKey']];

    if ($idempotencyKey !== null) {
        $headers[] = 'Idempotency-Key: ' . $idempotencyKey;
    }

    curl_setopt_array($request, [
        CURLOPT_CUSTOMREQUEST => $method,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_CONNECTTIMEOUT => 5,
        CURLOPT_TIMEOUT => 20,
        CURLOPT_HTTPHEADER => $headers,
    ]);

    if ($method === 'POST') {
        curl_setopt($request, CURLOPT_POSTFIELDS, http_build_query($params));
    }

    $response = curl_exec($request);
    $statusCode = (int) curl_getinfo($request, CURLINFO_RESPONSE_CODE);

    $payload = is_string($response) ? json_decode($response, true) : null;

    if (!is_array($payload) || $statusCode < 200 || $statusCode >= 300) {
        error_log('Stripe error: ' . ($payload['error']['message'] ?? 'respuesta no válida'));
        throw new RuntimeException('El proveedor de pagos no ha podido procesar la solicitud.');
    }

    return $payload;
}

function createStripeCheckoutSession(array $stripeConfig, string $frontendBaseUrl, string $orderId, string $customerEmail, array $items): array
{
    $lineItems = [];

    foreach (array_values($items) as $index => $item) {
        $lineItems[$index] = [
            'quantity' => $item['quantity'],
            'price_data' => [
                'currency' => 'eur',
                'unit_amount' => $item['priceCents'],
                'product_data' => ['name' => $item['name']],
            ],
        ];
    }

    $returnUrl = rtrim($frontendBaseUrl, '/') . '/#/catalogo-local';

    return stripeRequest($stripeConfig, 'POST', '/checkout/sessions', [
        'mode' => 'payment',
        'customer_email' => $customerEmail,
        'client_reference_id' => $orderId,
        'metadata' => ['order_id' => $orderId],
        'line_items' => $lineItems,
        'success_url' => $returnUrl . '?pedido=' . $orderId,
        'cancel_url' => $returnUrl . '?cancelado=1',
    ], 'catalog-order-' . $orderId);
}

function retrieveStripeCheckoutSession(array $stripeConfig, string $sessionId): array
{
    return stripeRequest($stripeConfig, 'GET', '/checkout/sessions/' . rawurlencode($sessionId));
}

function isValidStripeWebhookSignature(string $payload, string $signatureHeader, string $secret, int $toleranceSeconds = 300): bool
{
    if ($secret === '') {
        return false;
    }

    $timestamp = null;
    $signatures = [];

    foreach (explode(',', $signatureHeader) as $part) {
        [$key, $value] = array_pad(explode('=', trim($part), 2), 2, '');

        if ($key === 't') {
            $timestamp = $value;
        } elseif ($key === 'v1') {
            $signatures[] = $value;
        }
    }

    if ($timestamp === null || !ctype_digit($timestamp) || abs(time() - (int) $timestamp) > $toleranceSeconds) {
        return false;
    }

    $expected = hash_hmac('sha256', $timestamp . '.' . $payload, $secret);

    foreach ($signatures as $signature) {
        if (hash_equals($expected, $signature)) {
            return true;
        }
    }

    return false;
}
