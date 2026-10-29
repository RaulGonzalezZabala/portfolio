-- TicketPulse: persistencia de eventos de venta.
-- Importa este archivo una sola vez en la base de datos `portfolio`.
-- No modifica las tablas existentes del portfolio.

CREATE TABLE ticket_events (
    id CHAR(36) NOT NULL,
    name VARCHAR(160) NOT NULL,
    purchase_url VARCHAR(500) NOT NULL,
    sale_start_at DATETIME(3) NOT NULL,
    timezone VARCHAR(64) NOT NULL,
    auto_open TINYINT(1) NOT NULL DEFAULT 0,
    notes TEXT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_ticket_events_sale_start_at (sale_start_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;