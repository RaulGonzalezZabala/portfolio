<?php

declare(strict_types=1);

function findCatalogCategories(PDO $connection): array
{
    $statement = $connection->query(
        'SELECT slug, name FROM catalog_categories ORDER BY display_order ASC, id ASC'
    );

    return array_map(
        static fn (array $row): array => ['slug' => $row['slug'], 'name' => $row['name']],
        $statement->fetchAll()
    );
}

function findCatalogProducts(PDO $connection): array
{
    $statement = $connection->query(
        'SELECT
            catalog_products.slug,
            catalog_products.name,
            catalog_products.description,
            catalog_products.price_cents,
            catalog_products.accent,
            catalog_products.label,
            catalog_categories.slug AS category_slug,
            catalog_categories.name AS category_name
        FROM catalog_products
        INNER JOIN catalog_categories ON catalog_categories.id = catalog_products.category_id
        WHERE catalog_products.is_published = 1
        ORDER BY catalog_products.display_order ASC, catalog_products.id ASC'
    );

    return array_map(
        static fn (array $row): array => [
            'id' => $row['slug'],
            'name' => $row['name'],
            'description' => $row['description'],
            'price' => (int) $row['price_cents'] / 100,
            'accent' => $row['accent'],
            'label' => $row['label'],
            'category' => ['slug' => $row['category_slug'], 'name' => $row['category_name']],
        ],
        $statement->fetchAll()
    );
}
