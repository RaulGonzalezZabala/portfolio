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
