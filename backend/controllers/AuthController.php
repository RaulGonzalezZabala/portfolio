<?php

declare(strict_types=1);

function configureSession(): void
{
    if (session_status() === PHP_SESSION_ACTIVE) {
        return;
    }

    session_set_cookie_params([
        'httponly' => true,
        'samesite' => 'Lax',
        'secure' => isHttpsRequest(),
    ]);
    session_start();
}

function isHttpsRequest(): bool
{
    return ($_SERVER['HTTPS'] ?? '') !== '' && $_SERVER['HTTPS'] !== 'off';
}

function currentUser(?PDO $connection = null): ?array
{
    configureSession();
    $user = $_SESSION['user'] ?? null;

    if (!is_array($user)) {
        return null;
    }

    $sessionVersion = isset($user['authVersion']) ? (int) $user['authVersion'] : -1;

    if ($connection !== null && !isUserSessionVersionCurrent($connection, $user['id'], $sessionVersion)) {
        destroyCurrentSession();

        return null;
    }

    return $user;
}

function requireAuthenticatedUser(PDO $connection): array
{
    $user = currentUser($connection);

    if ($user === null) {
        sendError(401, 'authentication_required', 'Debes iniciar sesión para continuar.');
    }

    return $user;
}

function requireCsrfToken(): void
{
    configureSession();
    $requestToken = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';

    if (!is_string($requestToken) || !hash_equals($_SESSION['csrf_token'] ?? '', $requestToken)) {
        sendError(403, 'invalid_csrf_token', 'La solicitud no tiene un token de seguridad válido.');
    }
}

function showCurrentUser(PDO $connection): never
{
    $user = currentUser($connection);

    sendJson(200, [
        'data' => [
            'user' => publicUser($user),
            'csrfToken' => csrfToken(),
        ],
    ]);
}

function registerUser(PDO $connection, array $config): never
{
    $payload = readJsonBody();
    $email = normalizeEmail($payload['email'] ?? null);
    $password = validatePassword($payload['password'] ?? null);

    if (($payload['termsAccepted'] ?? false) !== true || ($payload['privacyAccepted'] ?? false) !== true) {
        sendError(422, 'policies_required', 'Debes aceptar los términos y la política de privacidad.');
    }

    ensureEmailConfiguration($config['email']);
    enforceAuthRateLimit($connection, 'register', $email, 5, 60, 12, 60);
    $user = findUserByEmail($connection, $email);

    if ($user === null) {
        $algorithm = defined('PASSWORD_ARGON2ID') ? PASSWORD_ARGON2ID : PASSWORD_DEFAULT;
        try {
            $user = createUser($connection, [
                'id' => generateUserId(),
                'email' => $email,
                'passwordHash' => password_hash($password, $algorithm),
            ]);
        } catch (PDOException $error) {
            if ($error->getCode() !== '23000') {
                throw $error;
            }

            sendJson(202, ['data' => ['message' => 'Si el correo puede registrarse, recibirás instrucciones para verificarlo.']]);
        }
    } elseif ($user['email_verified_at'] !== null) {
        sendJson(202, ['data' => ['message' => 'Si el correo puede registrarse, recibirás instrucciones para verificarlo.']]);
    }

    sendVerificationEmail($connection, $user, $config);
    sendJson(202, ['data' => ['message' => 'Si el correo puede registrarse, recibirás instrucciones para verificarlo.']]);
}

function loginUser(PDO $connection): never
{
    $payload = readJsonBody();
    $email = normalizeEmail($payload['email'] ?? null);
    enforceAuthRateLimit($connection, 'login', $email, 10, 15, 40, 15);
    $password = $payload['password'] ?? null;
    $user = findUserByEmail($connection, $email);

    if ($user === null || !is_string($password) || !password_verify($password, $user['password_hash'])) {
        sendError(401, 'invalid_credentials', 'El correo o la contraseña no son válidos.');
    }

    if ($user['email_verified_at'] === null) {
        sendError(403, 'email_not_verified', 'Confirma tu correo antes de iniciar sesión. Puedes solicitar otro enlace de verificación.');
    }

    $algorithm = defined('PASSWORD_ARGON2ID') ? PASSWORD_ARGON2ID : PASSWORD_DEFAULT;

    if (password_needs_rehash($user['password_hash'], $algorithm)) {
        $statement = $connection->prepare('UPDATE users SET password_hash = :password_hash WHERE id = :id');
        $statement->execute([
            'password_hash' => password_hash($password, $algorithm),
            'id' => $user['id'],
        ]);
    }

    startAuthenticatedSession(mapUser($user));
    sendJson(200, ['data' => authenticatedPayload()]);
}

function verifyUserEmail(PDO $connection): never
{
    $payload = readJsonBody();
    $token = validateActionToken($payload['token'] ?? null);
    enforceAuthRateLimit($connection, 'verify', clientIpAddress(), 20, 60, 20, 60);
    $user = findUserByAuthToken($connection, 'email_verification_tokens', $token);

    if ($user === null) {
        sendError(400, 'invalid_or_expired_token', 'El enlace no es válido o ha caducado. Solicita uno nuevo.');
    }

    $connection->beginTransaction();
    markUserEmailVerified($connection, $user['id']);
    deleteAuthToken($connection, 'email_verification_tokens', $user['token_hash']);
    $connection->commit();

    sendJson(200, ['data' => ['message' => 'Correo verificado. Ya puedes iniciar sesión.']]);
}

function resendVerificationEmail(PDO $connection, array $config): never
{
    $email = normalizeEmail(readJsonBody()['email'] ?? null);
    ensureEmailConfiguration($config['email']);
    enforceAuthRateLimit($connection, 'resend-verification', $email, 3, 60, 12, 60);
    $user = findUserByEmail($connection, $email);

    if ($user !== null && $user['email_verified_at'] === null) {
        sendVerificationEmail($connection, $user, $config);
    }

    sendJson(202, ['data' => ['message' => 'Si la cuenta necesita verificación, enviaremos un nuevo enlace.']]);
}

function requestPasswordReset(PDO $connection, array $config): never
{
    $email = normalizeEmail(readJsonBody()['email'] ?? null);
    ensureEmailConfiguration($config['email']);
    enforceAuthRateLimit($connection, 'password-reset', $email, 3, 60, 12, 60);
    $user = findUserByEmail($connection, $email);

    if ($user !== null && $user['email_verified_at'] !== null) {
        $token = createAuthToken($connection, 'password_reset_tokens', $user['id'], 1);
        $url = buildActionUrl($config['frontendBaseUrl'], 'reset', $token);
        deliverTransactionalEmail(
            $config['email'],
            $email,
            'Restablece tu contraseña de TicketPulse',
            "Para elegir una contraseña nueva, abre este enlace en la próxima hora:\n\n{$url}\n\nSi no has solicitado el cambio, ignora este correo."
        );
    }

    sendJson(202, ['data' => ['message' => 'Si existe una cuenta verificada con ese correo, recibirás instrucciones para restablecer la contraseña.']]);
}

function resetPassword(PDO $connection): never
{
    $payload = readJsonBody();
    $token = validateActionToken($payload['token'] ?? null);
    $password = validatePassword($payload['password'] ?? null);
    enforceAuthRateLimit($connection, 'password-reset-confirm', clientIpAddress(), 10, 60, 20, 60);
    $user = findUserByAuthToken($connection, 'password_reset_tokens', $token);

    if ($user === null) {
        sendError(400, 'invalid_or_expired_token', 'El enlace no es válido o ha caducado. Solicita otro.');
    }

    $algorithm = defined('PASSWORD_ARGON2ID') ? PASSWORD_ARGON2ID : PASSWORD_DEFAULT;
    $connection->beginTransaction();
    updateUserPassword($connection, $user['id'], password_hash($password, $algorithm));
    deleteAuthToken($connection, 'password_reset_tokens', $user['token_hash']);
    deleteUserVerificationTokens($connection, $user['id']);
    $connection->commit();

    sendJson(200, ['data' => ['message' => 'Contraseña actualizada. Ya puedes iniciar sesión.']]);
}

function logoutUser(): never
{
    destroyCurrentSession();
    sendJson(200, ['data' => null]);
}

function destroyCurrentSession(): void
{
    configureSession();
    $_SESSION = [];
    $cookie = session_get_cookie_params();
    setcookie(session_name(), '', [
        'expires' => time() - 42000,
        'path' => $cookie['path'],
        'domain' => $cookie['domain'],
        'secure' => $cookie['secure'],
        'httponly' => $cookie['httponly'],
        'samesite' => $cookie['samesite'],
    ]);
    session_destroy();
}

function startAuthenticatedSession(array $user): void
{
    configureSession();
    session_regenerate_id(true);
    $_SESSION['user'] = $user;
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
}

function authenticatedPayload(): array
{
    return [
        'user' => publicUser(currentUser()),
        'csrfToken' => csrfToken(),
    ];
}

function publicUser(?array $user): ?array
{
    if ($user === null) {
        return null;
    }

    unset($user['authVersion']);

    return $user;
}

function csrfToken(): string
{
    configureSession();
    $_SESSION['csrf_token'] ??= bin2hex(random_bytes(32));

    return $_SESSION['csrf_token'];
}

function sendVerificationEmail(PDO $connection, array $user, array $config): void
{
    $token = createAuthToken($connection, 'email_verification_tokens', $user['id'], 24);
    $url = buildActionUrl($config['frontendBaseUrl'], 'verify', $token);
    deliverTransactionalEmail(
        $config['email'],
        $user['email'],
        'Verifica tu correo de TicketPulse',
        "Para verificar tu dirección de correo, abre este enlace en las próximas 24 horas:\n\n{$url}\n\nSi no has creado una cuenta de TicketPulse, ignora este correo."
    );
}

function deliverTransactionalEmail(array $emailConfig, string $recipient, string $subject, string $text): void
{
    try {
        sendTransactionalEmail($emailConfig, $recipient, $subject, $text);
    } catch (RuntimeException $error) {
        sendError(503, 'email_delivery_failed', $error->getMessage());
    }
}

function ensureEmailConfiguration(array $emailConfig): void
{
    if ($emailConfig['provider'] !== 'brevo' || $emailConfig['apiKey'] === '' || $emailConfig['fromEmail'] === '') {
        sendError(503, 'email_not_configured', 'El envío de correo todavía no está configurado. Añade la clave API y un remitente verificado de Brevo en backend/.env.');
    }
}

function enforceAuthRateLimit(
    PDO $connection,
    string $action,
    string $emailOrIp,
    int $perIdentifierLimit,
    int $windowMinutes,
    int $perIpLimit,
    int $ipWindowMinutes,
): void {
    consumeAuthRateLimit($connection, $action . '-identity', $emailOrIp, $perIdentifierLimit, $windowMinutes);
    consumeAuthRateLimit($connection, $action . '-ip', clientIpAddress(), $perIpLimit, $ipWindowMinutes);
}

function clientIpAddress(): string
{
    return $_SERVER['REMOTE_ADDR'] ?? 'unknown';
}

function normalizeEmail(mixed $value): string
{
    $email = is_string($value) ? strtolower(trim($value)) : '';

    if (filter_var($email, FILTER_VALIDATE_EMAIL) === false || strlen($email) > 254) {
        sendError(422, 'invalid_email', 'Escribe una dirección de correo válida.');
    }

    return $email;
}

function validatePassword(mixed $value): string
{
    if (!is_string($value) || strlen($value) < 12 || strlen($value) > 72) {
        sendError(422, 'invalid_password', 'La contraseña debe tener entre 12 y 72 bytes.');
    }

    return $value;
}

function validateActionToken(mixed $value): string
{
    if (!is_string($value) || preg_match('/^[a-f0-9]{64}$/', $value) !== 1) {
        sendError(400, 'invalid_or_expired_token', 'El enlace no es válido o ha caducado.');
    }

    return $value;
}

function generateUserId(): string
{
    $bytes = random_bytes(16);
    $bytes[6] = chr((ord($bytes[6]) & 0x0f) | 0x40);
    $bytes[8] = chr((ord($bytes[8]) & 0x3f) | 0x80);
    $hex = bin2hex($bytes);

    return sprintf('%s-%s-%s-%s-%s', substr($hex, 0, 8), substr($hex, 8, 4), substr($hex, 12, 4), substr($hex, 16, 4), substr($hex, 20));
}
