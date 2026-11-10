<?php

declare(strict_types=1);

function getConfig(): array
{
    $environmentPath = dirname(__DIR__) . '/.env';
    $environment = [];

    if (is_file($environmentPath)) {
        $parsedEnvironment = parse_ini_file($environmentPath, false, INI_SCANNER_RAW);
        $environment = is_array($parsedEnvironment) ? $parsedEnvironment : [];
    }

    return [
        'database' => [
            'host' => $environment['DB_HOST'] ?? '',
            'port' => $environment['DB_PORT'] ?? '',
            'name' => $environment['DB_NAME'] ?? '',
            'user' => $environment['DB_USER'] ?? '',
            'password' => $environment['DB_PASSWORD'] ?? '',
        ],
        'catalogDatabase' => [
            'host' => $environment['CATALOG_DB_HOST'] ?? $environment['DB_HOST'] ?? '',
            'port' => $environment['CATALOG_DB_PORT'] ?? $environment['DB_PORT'] ?? '',
            'name' => $environment['CATALOG_DB_NAME'] ?? $environment['DB_NAME'] ?? '',
            'user' => $environment['CATALOG_DB_USER'] ?? $environment['DB_USER'] ?? '',
            'password' => $environment['CATALOG_DB_PASSWORD'] ?? $environment['DB_PASSWORD'] ?? '',
        ],
        'stripe' => [
            'secretKey' => $environment['STRIPE_SECRET_KEY'] ?? '',
            'webhookSecret' => $environment['STRIPE_WEBHOOK_SECRET'] ?? '',
        ],
        'corsAllowedOrigin' => $environment['CORS_ALLOWED_ORIGIN'] ?? 'http://localhost:5173',
        'frontendBaseUrl' => $environment['FRONTEND_BASE_URL'] ?? 'http://localhost:5173',
        'email' => [
            'provider' => $environment['EMAIL_PROVIDER'] ?? 'brevo',
            'apiKey' => $environment['BREVO_API_KEY'] ?? '',
            'fromEmail' => $environment['MAIL_FROM_EMAIL'] ?? '',
            'fromName' => $environment['MAIL_FROM_NAME'] ?? 'TicketPulse',
        ],
    ];
}
