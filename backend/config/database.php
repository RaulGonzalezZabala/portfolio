<?php

declare(strict_types=1);

function createDatabaseConnection(array $databaseConfig): PDO
{
    foreach (['host', 'port', 'name', 'user'] as $setting) {
        if ($databaseConfig[$setting] === '') {
            throw new RuntimeException('La configuración de base de datos no está completa.');
        }
    }

    $dsn = sprintf(
        'mysql:host=%s;port=%s;dbname=%s;charset=utf8mb4',
        $databaseConfig['host'],
        $databaseConfig['port'],
        $databaseConfig['name'],
    );

    return new PDO($dsn, $databaseConfig['user'], $databaseConfig['password'], [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);
}
