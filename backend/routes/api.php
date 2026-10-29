<?php

declare(strict_types=1);

function handleApiRequest(string $method, string $path, array $config): never
{
    applyCorsPolicy($config['corsAllowedOrigin']);

    if ($method === 'OPTIONS') {
        http_response_code(204);
        exit;
    }

    if ($path === '/api/health') {
        ensureMethod($method, ['GET']);
        health();
    }

    if ($path === '/api/projects') {
        ensureMethod($method, ['GET']);
        listProjects(createDatabaseConnection($config['database']));
    }

    if (preg_match('#^/api/projects/([a-z0-9]+(?:-[a-z0-9]+)*)$#', $path, $matches) === 1) {
        ensureMethod($method, ['GET']);
        showProject(createDatabaseConnection($config['database']), $matches[1]);
    }

    if ($path === '/api/technologies') {
        ensureMethod($method, ['GET']);
        listTechnologies(createDatabaseConnection($config['database']));
    }

    if ($path === '/api/auth/me') {
        ensureMethod($method, ['GET']);
        showCurrentUser(createDatabaseConnection($config['database']));
    }

    if ($path === '/api/auth/register') {
        ensureMethod($method, ['POST']);
        registerUser(createDatabaseConnection($config['database']), $config);
    }

    if ($path === '/api/auth/login') {
        ensureMethod($method, ['POST']);
        loginUser(createDatabaseConnection($config['database']));
    }

    if ($path === '/api/auth/verify') {
        ensureMethod($method, ['POST']);
        verifyUserEmail(createDatabaseConnection($config['database']));
    }

    if ($path === '/api/auth/resend-verification') {
        ensureMethod($method, ['POST']);
        resendVerificationEmail(createDatabaseConnection($config['database']), $config);
    }

    if ($path === '/api/auth/password-reset/request') {
        ensureMethod($method, ['POST']);
        requestPasswordReset(createDatabaseConnection($config['database']), $config);
    }

    if ($path === '/api/auth/password-reset/confirm') {
        ensureMethod($method, ['POST']);
        resetPassword(createDatabaseConnection($config['database']));
    }

    if ($path === '/api/auth/logout') {
        ensureMethod($method, ['POST']);
        $connection = createDatabaseConnection($config['database']);
        requireAuthenticatedUser($connection);
        requireCsrfToken();
        logoutUser();
    }

    if ($path === '/api/ticket-events') {
        $connection = createDatabaseConnection($config['database']);
        $user = requireAuthenticatedUser($connection);

        if ($method === 'GET') {
            listTicketEvents($connection, $user['id']);
        }

        if ($method === 'POST') {
            requireCsrfToken();
            storeTicketEvent($connection, $user['id']);
        }

        ensureMethod($method, ['GET', 'POST']);
    }

    if (preg_match('#^/api/ticket-events/([a-f0-9-]{36})$#i', $path, $matches) === 1) {
        $connection = createDatabaseConnection($config['database']);
        $user = requireAuthenticatedUser($connection);

        if ($method === 'GET') {
            showTicketEvent($connection, $matches[1], $user['id']);
        }

        if ($method === 'PUT') {
            requireCsrfToken();
            replaceTicketEvent($connection, $matches[1], $user['id']);
        }

        if ($method === 'DELETE') {
            requireCsrfToken();
            destroyTicketEvent($connection, $matches[1], $user['id']);
        }

        ensureMethod($method, ['GET', 'PUT', 'DELETE']);
    }

    sendError(404, 'route_not_found', 'La ruta solicitada no existe.');
}

function ensureMethod(string $method, array $allowedMethods): void
{
    if (in_array($method, $allowedMethods, true)) {
        return;
    }

    header('Allow: ' . implode(', ', [...$allowedMethods, 'OPTIONS']));
    sendError(405, 'method_not_allowed', 'El método solicitado no está permitido.');
}

function applyCorsPolicy(string $allowedOrigin): void
{
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    header('Vary: Origin');

    if ($origin === $allowedOrigin) {
        header("Access-Control-Allow-Origin: {$allowedOrigin}");
        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, X-CSRF-Token');
        header('Access-Control-Allow-Credentials: true');
        header('Vary: Origin');
    }
}
