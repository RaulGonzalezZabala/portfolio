<?php

declare(strict_types=1);

const TICKET_EVENT_STATUSES = ['pending', 'active', 'finished', 'error'];

function listTicketEvents(PDO $connection, string $userId): never
{
    sendJson(200, ['data' => findTicketEvents($connection, $userId)]);
}

function showTicketEvent(PDO $connection, string $id, string $userId): never
{
    $event = findTicketEventById($connection, $id, $userId);

    if ($event === null) {
        sendError(404, 'ticket_event_not_found', 'El evento solicitado no existe.');
    }

    sendJson(200, ['data' => $event]);
}

function storeTicketEvent(PDO $connection, string $userId): never
{
    $event = validateTicketEvent(readJsonBody());

    if ($event['saleStartAt'] <= new DateTimeImmutable('now', new DateTimeZone('UTC'))) {
        sendError(422, 'sale_start_at_in_past', 'La apertura de venta debe ser una fecha futura.');
    }

    $event['id'] = generateTicketEventId();
    $event['status'] = 'pending';

    sendJson(201, ['data' => createTicketEvent($connection, $event, $userId)]);
}

function replaceTicketEvent(PDO $connection, string $id, string $userId): never
{
    if (findTicketEventById($connection, $id, $userId) === null) {
        sendError(404, 'ticket_event_not_found', 'El evento solicitado no existe.');
    }

    $event = validateTicketEvent(readJsonBody());
    $event['id'] = $id;

    sendJson(200, ['data' => updateTicketEvent($connection, $id, $event, $userId)]);
}

function destroyTicketEvent(PDO $connection, string $id, string $userId): never
{
    if (!deleteTicketEvent($connection, $id, $userId)) {
        sendError(404, 'ticket_event_not_found', 'El evento solicitado no existe.');
    }

    http_response_code(204);
    exit;
}

function readJsonBody(): array
{
    $body = file_get_contents('php://input');
    $payload = json_decode($body, true);

    if (!is_array($payload)) {
        sendError(400, 'invalid_json', 'El cuerpo de la solicitud debe contener JSON válido.');
    }

    return $payload;
}

function validateTicketEvent(array $payload): array
{
    $name = trim((string) ($payload['name'] ?? ''));
    $url = trim((string) ($payload['url'] ?? ''));
    $timezone = trim((string) ($payload['timezone'] ?? ''));
    $notes = trim((string) ($payload['notes'] ?? ''));
    $status = (string) ($payload['status'] ?? 'pending');
    $autoOpen = $payload['autoOpen'] ?? false;

    if ($name === '' || mb_strlen($name) > 160) {
        sendError(422, 'invalid_name', 'El nombre es obligatorio y no puede superar 160 caracteres.');
    }

    if (filter_var($url, FILTER_VALIDATE_URL) === false || !preg_match('#^https?://#i', $url)) {
        sendError(422, 'invalid_url', 'La URL de compra debe ser válida y usar HTTP o HTTPS.');
    }

    try {
        $saleStartAt = new DateTimeImmutable((string) ($payload['saleStartAt'] ?? ''));
    } catch (Exception) {
        sendError(422, 'invalid_sale_start_at', 'La fecha de apertura debe ser un valor ISO válido.');
    }

    try {
        new DateTimeZone($timezone);
    } catch (Exception) {
        sendError(422, 'invalid_timezone', 'La zona horaria no es válida.');
    }

    if (!is_bool($autoOpen)) {
        sendError(422, 'invalid_auto_open', 'La apertura automática debe ser un valor booleano.');
    }

    if (!in_array($status, TICKET_EVENT_STATUSES, true)) {
        sendError(422, 'invalid_status', 'El estado del evento no es válido.');
    }

    return [
        'name' => $name,
        'url' => $url,
        'saleStartAt' => $saleStartAt->setTimezone(new DateTimeZone('UTC')),
        'timezone' => $timezone,
        'autoOpen' => $autoOpen,
        'notes' => $notes,
        'status' => $status,
    ];
}

function generateTicketEventId(): string
{
    $bytes = random_bytes(16);
    $bytes[6] = chr((ord($bytes[6]) & 0x0f) | 0x40);
    $bytes[8] = chr((ord($bytes[8]) & 0x3f) | 0x80);
    $hex = bin2hex($bytes);

    return sprintf('%s-%s-%s-%s-%s',
        substr($hex, 0, 8),
        substr($hex, 8, 4),
        substr($hex, 12, 4),
        substr($hex, 16, 4),
        substr($hex, 20),
    );
}