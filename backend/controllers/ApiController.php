<?php

declare(strict_types=1);

function sendJson(int $statusCode, array $payload): never
{
    http_response_code($statusCode);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function sendError(int $statusCode, string $code, string $message): never
{
    sendJson($statusCode, [
        'error' => [
            'code' => $code,
            'message' => $message,
        ],
    ]);
}

function health(): never
{
    sendJson(200, ['status' => 'ok']);
}

function listProjects(PDO $connection): never
{
    sendJson(200, ['data' => findPublishedProjects($connection)]);
}

function showProject(PDO $connection, string $slug): never
{
    $project = findPublishedProjectBySlug($connection, $slug);

    if ($project === null) {
        sendError(404, 'project_not_found', 'El proyecto solicitado no existe o no está publicado.');
    }

    sendJson(200, ['data' => $project]);
}

function listTechnologies(PDO $connection): never
{
    sendJson(200, ['data' => findTechnologies($connection)]);
}
