<?php

declare(strict_types=1);

function sendTransactionalEmail(array $emailConfig, string $recipient, string $subject, string $text): void
{
    if ($emailConfig['provider'] !== 'brevo') {
        throw new RuntimeException('El proveedor de email no está configurado.');
    }

    if ($emailConfig['apiKey'] === '' || $emailConfig['fromEmail'] === '') {
        throw new RuntimeException('Falta configurar BREVO_API_KEY y MAIL_FROM_EMAIL en backend/.env.');
    }

    $request = curl_init('https://api.brevo.com/v3/smtp/email');

    if ($request === false) {
        throw new RuntimeException('No se pudo inicializar el cliente de correo.');
    }

    $payload = json_encode([
        'sender' => [
            'name' => $emailConfig['fromName'],
            'email' => $emailConfig['fromEmail'],
        ],
        'to' => [['email' => $recipient]],
        'subject' => $subject,
        'textContent' => $text,
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

    curl_setopt_array($request, [
        CURLOPT_POST => true,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_CONNECTTIMEOUT => 5,
        CURLOPT_TIMEOUT => 15,
        CURLOPT_HTTPHEADER => [
            'accept: application/json',
            'api-key: ' . $emailConfig['apiKey'],
            'content-type: application/json',
        ],
        CURLOPT_POSTFIELDS => $payload,
    ]);

    $response = curl_exec($request);
    $status = (int) curl_getinfo($request, CURLINFO_RESPONSE_CODE);
    $curlError = curl_error($request);
    curl_close($request);

    if ($response === false || $status < 200 || $status >= 300) {
        error_log(sprintf('Transactional email failed (HTTP %d): %s', $status, $curlError));
        throw new RuntimeException('No se pudo enviar el email. Revisa la configuración del proveedor y vuelve a intentarlo.');
    }
}

function buildActionUrl(string $baseUrl, string $action, string $token): string
{
    $query = http_build_query(['' . $action => $token]);

    return rtrim($baseUrl, '/') . '/#/ticket-pulse?' . $query;
}
