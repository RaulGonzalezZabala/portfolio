-- Catálogo local ficticio: pedidos y líneas de pedido.
-- Importa este archivo una sola vez en la misma base de datos donde importaste catalog.sql.
-- `user_id` referencia a users.id de la base de cuentas, pero sin clave foránea porque
-- el catálogo puede vivir en una base de datos distinta.

CREATE TABLE catalog_orders (
    id CHAR(36) NOT NULL,
    user_id CHAR(36) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    total_cents INT UNSIGNED NOT NULL,
    currency CHAR(3) NOT NULL DEFAULT 'EUR',
    stripe_session_id VARCHAR(255) NULL,
    stripe_payment_intent_id VARCHAR(255) NULL,
    shipping_name VARCHAR(160) NOT NULL,
    shipping_phone VARCHAR(30) NULL,
    shipping_address VARCHAR(255) NOT NULL,
    shipping_city VARCHAR(120) NOT NULL,
    shipping_postal_code VARCHAR(12) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    paid_at TIMESTAMP NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uq_catalog_orders_stripe_session (stripe_session_id),
    KEY idx_catalog_orders_user (user_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE catalog_order_items (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    order_id CHAR(36) NOT NULL,
    product_slug VARCHAR(120) NOT NULL,
    product_name VARCHAR(160) NOT NULL,
    unit_price_cents INT UNSIGNED NOT NULL,
    quantity SMALLINT UNSIGNED NOT NULL,
    PRIMARY KEY (id),
    KEY idx_catalog_order_items_order (order_id),
    CONSTRAINT fk_catalog_order_items_order
        FOREIGN KEY (order_id) REFERENCES catalog_orders (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
