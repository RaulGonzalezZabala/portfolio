<?php

declare(strict_types=1);

function consumeAuthRateLimit(PDO $connection, string $action, string $identifier, int $limit, int $windowMinutes): void
{
    if (random_int(1, 100) === 1) {
        $connection->exec(
            'DELETE FROM auth_rate_limits WHERE window_started_at < DATE_SUB(UTC_TIMESTAMP(), INTERVAL 1 DAY)'
        );
    }

    $bucketHash = hash('sha256', $action . '|' . $identifier);
    $statement = $connection->prepare(
        'INSERT INTO auth_rate_limits (bucket_hash, attempts, window_started_at)
        VALUES (:bucket_hash, 1, UTC_TIMESTAMP())
        ON DUPLICATE KEY UPDATE
            attempts = IF(
                window_started_at < DATE_SUB(UTC_TIMESTAMP(), INTERVAL ' . $windowMinutes . ' MINUTE),
                1,
                attempts + 1
            ),
            window_started_at = IF(
                window_started_at < DATE_SUB(UTC_TIMESTAMP(), INTERVAL ' . $windowMinutes . ' MINUTE),
                UTC_TIMESTAMP(),
                window_started_at
            )'
    );
    $statement->execute(['bucket_hash' => $bucketHash]);

    $statement = $connection->prepare(
        'SELECT attempts FROM auth_rate_limits WHERE bucket_hash = :bucket_hash'
    );
    $statement->execute(['bucket_hash' => $bucketHash]);
    $attempts = (int) $statement->fetchColumn();

    if ($attempts > $limit) {
        header('Retry-After: ' . ($windowMinutes * 60));
        sendError(429, 'too_many_requests', 'Demasiados intentos. Espera un poco y vuelve a probar.');
    }
}

function createAuthToken(PDO $connection, string $table, string $userId, int $expiresInHours): string
{
    if (!in_array($table, ['email_verification_tokens', 'password_reset_tokens'], true)) {
        throw new InvalidArgumentException('Tipo de token de autenticación no válido.');
    }

    $token = bin2hex(random_bytes(32));
    $statement = $connection->prepare("DELETE FROM {$table} WHERE user_id = :user_id");
    $statement->execute(['user_id' => $userId]);

    $statement = $connection->prepare(
        "INSERT INTO {$table} (user_id, token_hash, expires_at)
        VALUES (:user_id, :token_hash, DATE_ADD(UTC_TIMESTAMP(), INTERVAL {$expiresInHours} HOUR))"
    );
    $statement->execute([
        'user_id' => $userId,
        'token_hash' => hash('sha256', $token),
    ]);

    return $token;
}

function findUserByAuthToken(PDO $connection, string $table, string $token): ?array
{
    if (!in_array($table, ['email_verification_tokens', 'password_reset_tokens'], true)) {
        throw new InvalidArgumentException('Tipo de token de autenticación no válido.');
    }

    $statement = $connection->prepare(
        "SELECT users.id, users.email, tokens.token_hash
        FROM {$table} AS tokens
        INNER JOIN users ON users.id = tokens.user_id
        WHERE tokens.token_hash = :token_hash AND tokens.expires_at > UTC_TIMESTAMP()"
    );
    $statement->execute(['token_hash' => hash('sha256', $token)]);
    $user = $statement->fetch();

    return $user === false ? null : $user;
}

function deleteAuthToken(PDO $connection, string $table, string $tokenHash): void
{
    if (!in_array($table, ['email_verification_tokens', 'password_reset_tokens'], true)) {
        throw new InvalidArgumentException('Tipo de token de autenticación no válido.');
    }

    $statement = $connection->prepare("DELETE FROM {$table} WHERE token_hash = :token_hash");
    $statement->execute(['token_hash' => $tokenHash]);
}

function deleteUserVerificationTokens(PDO $connection, string $userId): void
{
    $statement = $connection->prepare(
        'DELETE FROM email_verification_tokens WHERE user_id = :user_id'
    );
    $statement->execute(['user_id' => $userId]);
}
