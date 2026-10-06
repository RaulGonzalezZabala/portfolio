<?php

declare(strict_types=1);

function handleApiRequest(string $method, string $path, array $config): never
{
    applyCorsPolicy($config['corsAllowedOrigin']);

    if ($method === 'OPTIONS') {
        http_response_code(204);
        exit;
    }

    if ($method !== 'GET') {
        header('Allow: GET, OPTIONS');
        sendError(405, 'method_not_allowed', 'El método solicitado no está permitido.');
    }

    if ($path === '/api/health') {
        health();
    }

    if ($path === '/api/projects') {
        listProjects(createDatabaseConnection($config['database']));
    }

    if (preg_match('#^/api/projects/([a-z0-9]+(?:-[a-z0-9]+)*)$#', $path, $matches) === 1) {
        showProject(createDatabaseConnection($config['database']), $matches[1]);
    }

    if ($path === '/api/technologies') {
        listTechnologies(createDatabaseConnection($config['database']));
    }

    sendError(404, 'route_not_found', 'La ruta solicitada no existe.');
}

function applyCorsPolicy(string $allowedOrigin): void
{
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';

    if ($origin === $allowedOrigin) {
        header("Access-Control-Allow-Origin: {$allowedOrigin}");
        header('Access-Control-Allow-Methods: GET, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type');
        header('Vary: Origin');
    }
}
