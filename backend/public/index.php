<?php

declare(strict_types=1);

require_once dirname(__DIR__) . '/config/config.php';
require_once dirname(__DIR__) . '/config/database.php';
require_once dirname(__DIR__) . '/repositories/ProjectRepository.php';
require_once dirname(__DIR__) . '/repositories/TechnologyRepository.php';
require_once dirname(__DIR__) . '/repositories/TicketEventRepository.php';
require_once dirname(__DIR__) . '/repositories/UserRepository.php';
require_once dirname(__DIR__) . '/repositories/AuthSecurityRepository.php';
require_once dirname(__DIR__) . '/controllers/ApiController.php';
require_once dirname(__DIR__) . '/controllers/AuthController.php';
require_once dirname(__DIR__) . '/services/TransactionalEmailService.php';
require_once dirname(__DIR__) . '/controllers/TicketEventController.php';
require_once dirname(__DIR__) . '/routes/api.php';

function getApiPath(): string
{
    $requestPath = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';
    $apiPosition = strpos($requestPath, '/api');

    return $apiPosition === false ? $requestPath : substr($requestPath, $apiPosition);
}

try {
    handleApiRequest($_SERVER['REQUEST_METHOD'] ?? 'GET', getApiPath(), getConfig());
} catch (Throwable $exception) {
    error_log($exception->getMessage());
    sendError(500, 'internal_server_error', 'No se ha podido procesar la solicitud.');
}
