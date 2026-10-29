-- TicketPulse: usuarios y propiedad de eventos.
-- Ejecutar después de database/ticket-pulse.sql.

CREATE TABLE users (
    id CHAR(36) NOT NULL,
    email VARCHAR(254) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    terms_accepted_at DATETIME NOT NULL,
    privacy_accepted_at DATETIME NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE ticket_events
    ADD COLUMN user_id CHAR(36) NULL AFTER id,
    ADD KEY idx_ticket_events_user_id (user_id),
    ADD CONSTRAINT fk_ticket_events_user
        FOREIGN KEY (user_id) REFERENCES users (id)
        ON DELETE CASCADE;
