<?php

declare(strict_types=1);

function findTicketEvents(PDO $connection, string $userId): array
{
    $statement = $connection->prepare(
        'SELECT id, name, purchase_url, sale_start_at, timezone, auto_open, notes, status, created_at, updated_at
        FROM ticket_events
        WHERE user_id = :user_id
        ORDER BY sale_start_at ASC, created_at ASC'
    );
    $statement->execute(['user_id' => $userId]);

    return array_map('mapTicketEvent', $statement->fetchAll());
}

function findTicketEventById(PDO $connection, string $id, string $userId): ?array
{
    $statement = $connection->prepare(
        'SELECT id, name, purchase_url, sale_start_at, timezone, auto_open, notes, status, created_at, updated_at
        FROM ticket_events
        WHERE id = :id AND user_id = :user_id'
    );
    $statement->execute(['id' => $id, 'user_id' => $userId]);
    $event = $statement->fetch();

    return $event === false ? null : mapTicketEvent($event);
}

function createTicketEvent(PDO $connection, array $event, string $userId): array
{
    $statement = $connection->prepare(
        'INSERT INTO ticket_events (
            id, user_id, name, purchase_url, sale_start_at, timezone, auto_open, notes, status
        ) VALUES (
            :id, :user_id, :name, :purchase_url, :sale_start_at, :timezone, :auto_open, :notes, :status
        )'
    );
    $statement->execute([...ticketEventParameters($event), 'user_id' => $userId]);

    return findTicketEventById($connection, $event['id'], $userId);
}

function updateTicketEvent(PDO $connection, string $id, array $event, string $userId): ?array
{
    $statement = $connection->prepare(
        'UPDATE ticket_events
        SET
            name = :name,
            purchase_url = :purchase_url,
            sale_start_at = :sale_start_at,
            timezone = :timezone,
            auto_open = :auto_open,
            notes = :notes,
            status = :status
        WHERE id = :id AND user_id = :user_id'
    );
    $statement->execute([...ticketEventParameters([...$event, 'id' => $id]), 'user_id' => $userId]);

    return findTicketEventById($connection, $id, $userId);
}

function deleteTicketEvent(PDO $connection, string $id, string $userId): bool
{
    $statement = $connection->prepare('DELETE FROM ticket_events WHERE id = :id AND user_id = :user_id');
    $statement->execute(['id' => $id, 'user_id' => $userId]);

    return $statement->rowCount() === 1;
}

function ticketEventParameters(array $event): array
{
    return [
        'id' => $event['id'],
        'name' => $event['name'],
        'purchase_url' => $event['url'],
        'sale_start_at' => $event['saleStartAt']->format('Y-m-d H:i:s.v'),
        'timezone' => $event['timezone'],
        'auto_open' => $event['autoOpen'] ? 1 : 0,
        'notes' => $event['notes'] === '' ? null : $event['notes'],
        'status' => $event['status'],
    ];
}

function mapTicketEvent(array $event): array
{
    $saleStartAt = new DateTimeImmutable($event['sale_start_at'], new DateTimeZone('UTC'));
    $createdAt = new DateTimeImmutable($event['created_at'], new DateTimeZone('UTC'));
    $updatedAt = new DateTimeImmutable($event['updated_at'], new DateTimeZone('UTC'));

    return [
        'id' => $event['id'],
        'name' => $event['name'],
        'url' => $event['purchase_url'],
        'saleStartAt' => $saleStartAt->format('Y-m-d\TH:i:s.v\Z'),
        'timezone' => $event['timezone'],
        'autoOpen' => (bool) $event['auto_open'],
        'notes' => $event['notes'] ?? '',
        'status' => $event['status'],
        'createdAt' => $createdAt->format('Y-m-d\TH:i:s.v\Z'),
        'updatedAt' => $updatedAt->format('Y-m-d\TH:i:s.v\Z'),
    ];
}