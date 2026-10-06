<?php

declare(strict_types=1);

function findTechnologies(PDO $connection): array
{
    $statement = $connection->query(
        'SELECT id, name, slug
        FROM technologies
        ORDER BY name ASC'
    );

    return $statement->fetchAll();
}
