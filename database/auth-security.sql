-- TicketPulse: verificación de email, recuperación de contraseñas y límites de intentos.
-- Ejecutar una sola vez después de database/auth.sql.

ALTER TABLE users
    ADD COLUMN email_verified_at DATETIME NULL,
    ADD COLUMN auth_version INT UNSIGNED NOT NULL DEFAULT 0,
    ADD COLUMN terms_version VARCHAR(32) NOT NULL DEFAULT '2026-10-29',
    ADD COLUMN privacy_version VARCHAR(32) NOT NULL DEFAULT '2026-10-29';

CREATE TABLE email_verification_tokens (
    user_id CHAR(36) NOT NULL,
    token_hash CHAR(64) NOT NULL,
    expires_at DATETIME NOT NULL,
    PRIMARY KEY (user_id),
    UNIQUE KEY uq_email_verification_token_hash (token_hash),
    CONSTRAINT fk_email_verification_user
        FOREIGN KEY (user_id) REFERENCES users (id)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE password_reset_tokens (
    user_id CHAR(36) NOT NULL,
    token_hash CHAR(64) NOT NULL,
    expires_at DATETIME NOT NULL,
    PRIMARY KEY (user_id),
    UNIQUE KEY uq_password_reset_token_hash (token_hash),
    CONSTRAINT fk_password_reset_user
        FOREIGN KEY (user_id) REFERENCES users (id)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE auth_rate_limits (
    bucket_hash CHAR(64) NOT NULL,
    attempts SMALLINT UNSIGNED NOT NULL,
    window_started_at DATETIME NOT NULL,
    PRIMARY KEY (bucket_hash),
    KEY idx_auth_rate_limits_window (window_started_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
