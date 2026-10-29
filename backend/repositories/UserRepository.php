<?php

declare(strict_types=1);

function findUserByEmail(PDO $connection, string $email): ?array
{
    $statement = $connection->prepare(
        'SELECT id, email, password_hash, terms_accepted_at, privacy_accepted_at, email_verified_at, auth_version, terms_version, privacy_version, created_at
        FROM users
        WHERE email = :email'
    );
    $statement->execute(['email' => $email]);
    $user = $statement->fetch();

    return $user === false ? null : $user;
}

function createUser(PDO $connection, array $user): array
{
    $statement = $connection->prepare(
        'INSERT INTO users (
            id, email, password_hash, terms_accepted_at, privacy_accepted_at, terms_version, privacy_version
        ) VALUES (
            :id, :email, :password_hash, UTC_TIMESTAMP(), UTC_TIMESTAMP(), :terms_version, :privacy_version
        )'
    );
    $statement->execute([
        'id' => $user['id'],
        'email' => $user['email'],
        'password_hash' => $user['passwordHash'],
        'terms_version' => '2026-10-29',
        'privacy_version' => '2026-10-29',
    ]);

    return findUserByEmail($connection, $user['email']);
}

function mapUser(array $user): array
{
    return [
        'id' => $user['id'],
        'email' => $user['email'],
        'createdAt' => (new DateTimeImmutable($user['created_at'], new DateTimeZone('UTC')))->format('Y-m-d\TH:i:s.v\Z'),
        'authVersion' => (int) $user['auth_version'],
    ];
}

function markUserEmailVerified(PDO $connection, string $userId): void
{
    $statement = $connection->prepare(
        'UPDATE users SET email_verified_at = UTC_TIMESTAMP() WHERE id = :id AND email_verified_at IS NULL'
    );
    $statement->execute(['id' => $userId]);
}

function updateUserPassword(PDO $connection, string $userId, string $passwordHash): void
{
    $statement = $connection->prepare(
        'UPDATE users SET password_hash = :password_hash, auth_version = auth_version + 1 WHERE id = :id'
    );
    $statement->execute(['password_hash' => $passwordHash, 'id' => $userId]);
}

function isUserSessionVersionCurrent(PDO $connection, string $userId, int $sessionVersion): bool
{
    $statement = $connection->prepare('SELECT auth_version FROM users WHERE id = :id');
    $statement->execute(['id' => $userId]);
    $currentVersion = $statement->fetchColumn();

    return $currentVersion !== false && (int) $currentVersion === $sessionVersion;
}
