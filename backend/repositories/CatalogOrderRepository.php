<?php

declare(strict_types=1);

function findPublishedCatalogProductsBySlugs(PDO $connection, array $slugs): array
{
    $placeholders = implode(', ', array_fill(0, count($slugs), '?'));
    $statement = $connection->prepare(
        "SELECT slug, name, price_cents FROM catalog_products
        WHERE is_published = 1 AND slug IN ({$placeholders})"
    );
    $statement->execute(array_values($slugs));

    $products = [];

    foreach ($statement->fetchAll() as $row) {
        $products[$row['slug']] = [
            'slug' => $row['slug'],
            'name' => $row['name'],
            'priceCents' => (int) $row['price_cents'],
        ];
    }

    return $products;
}

function createCatalogOrder(PDO $connection, string $id, string $userId, array $shipping, array $items, int $totalCents): void
{
    $connection->beginTransaction();

    try {
        $order = $connection->prepare(
            'INSERT INTO catalog_orders (
                id, user_id, total_cents, shipping_name, shipping_phone,
                shipping_address, shipping_city, shipping_postal_code
            ) VALUES (
                :id, :user_id, :total_cents, :name, :phone, :address, :city, :postal_code
            )'
        );
        $order->execute([
            'id' => $id,
            'user_id' => $userId,
            'total_cents' => $totalCents,
            'name' => $shipping['name'],
            'phone' => $shipping['phone'] === '' ? null : $shipping['phone'],
            'address' => $shipping['address'],
            'city' => $shipping['city'],
            'postal_code' => $shipping['postalCode'],
        ]);

        $line = $connection->prepare(
            'INSERT INTO catalog_order_items (order_id, product_slug, product_name, unit_price_cents, quantity)
            VALUES (:order_id, :slug, :name, :price, :quantity)'
        );

        foreach ($items as $item) {
            $line->execute([
                'order_id' => $id,
                'slug' => $item['slug'],
                'name' => $item['name'],
                'price' => $item['priceCents'],
                'quantity' => $item['quantity'],
            ]);
        }

        $connection->commit();
    } catch (Throwable $exception) {
        $connection->rollBack();
        throw $exception;
    }
}

function attachStripeSessionToCatalogOrder(PDO $connection, string $orderId, string $stripeSessionId): void
{
    $statement = $connection->prepare(
        'UPDATE catalog_orders SET stripe_session_id = :session_id WHERE id = :id'
    );
    $statement->execute(['session_id' => $stripeSessionId, 'id' => $orderId]);
}

function findCatalogOrderForUser(PDO $connection, string $orderId, string $userId): ?array
{
    $statement = $connection->prepare(
        'SELECT id, status, stripe_session_id FROM catalog_orders WHERE id = :id AND user_id = :user_id'
    );
    $statement->execute(['id' => $orderId, 'user_id' => $userId]);

    return $statement->fetch() ?: null;
}

function findPaidCatalogInvoiceForUser(PDO $connection, string $orderId, string $userId): ?array
{
    $statement = $connection->prepare(
        "SELECT o.id, o.total_cents, o.currency, o.paid_at,
            o.shipping_name, o.shipping_phone, o.shipping_address, o.shipping_city, o.shipping_postal_code,
            i.product_slug, i.product_name, i.unit_price_cents, i.quantity
        FROM catalog_orders o
        INNER JOIN catalog_order_items i ON i.order_id = o.id
        WHERE o.id = :id AND o.user_id = :user_id AND o.status = 'paid'
        ORDER BY i.id ASC"
    );
    $statement->execute(['id' => $orderId, 'user_id' => $userId]);

    $invoice = null;
    foreach ($statement->fetchAll() as $row) {
        $invoice ??= [
            'orderId' => $row['id'],
            'paidAt' => $row['paid_at'],
            'totalCents' => (int) $row['total_cents'],
            'currency' => $row['currency'],
            'shipping' => [
                'name' => $row['shipping_name'],
                'phone' => $row['shipping_phone'],
                'address' => $row['shipping_address'],
                'city' => $row['shipping_city'],
                'postalCode' => $row['shipping_postal_code'],
            ],
            'items' => [],
        ];
        $invoice['items'][] = [
            'slug' => $row['product_slug'],
            'name' => $row['product_name'],
            'unitPriceCents' => (int) $row['unit_price_cents'],
            'quantity' => (int) $row['quantity'],
        ];
    }

    return $invoice;
}

function markCatalogOrderPaidByStripeSession(PDO $connection, string $stripeSessionId, ?string $paymentIntentId): void
{
    $statement = $connection->prepare(
        "UPDATE catalog_orders
        SET status = 'paid', paid_at = CURRENT_TIMESTAMP, stripe_payment_intent_id = :payment_intent
        WHERE stripe_session_id = :session_id AND status = 'pending'"
    );
    $statement->execute(['payment_intent' => $paymentIntentId, 'session_id' => $stripeSessionId]);
}

function findCatalogOrdersForUser(PDO $connection, string $userId): array
{
    $statement = $connection->prepare(
        'SELECT
            catalog_orders.id,
            catalog_orders.status,
            catalog_orders.total_cents,
            catalog_orders.created_at,
            catalog_order_items.product_name,
            catalog_order_items.unit_price_cents,
            catalog_order_items.quantity
        FROM catalog_orders
        INNER JOIN catalog_order_items ON catalog_order_items.order_id = catalog_orders.id
        WHERE catalog_orders.user_id = :user_id
        ORDER BY catalog_orders.created_at DESC, catalog_orders.id ASC, catalog_order_items.id ASC'
    );
    $statement->execute(['user_id' => $userId]);

    $orders = [];

    foreach ($statement->fetchAll() as $row) {
        $orders[$row['id']] ??= [
            'id' => $row['id'],
            'status' => $row['status'],
            'total' => (int) $row['total_cents'] / 100,
            'createdAt' => $row['created_at'],
            'items' => [],
        ];
        $orders[$row['id']]['items'][] = [
            'name' => $row['product_name'],
            'unitPrice' => (int) $row['unit_price_cents'] / 100,
            'quantity' => (int) $row['quantity'],
        ];
    }

    return array_values($orders);
}
