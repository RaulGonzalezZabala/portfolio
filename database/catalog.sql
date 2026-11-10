-- Catálogo local ficticio: categorías y conservas de ejemplo.
-- Importa este archivo una sola vez en la base de datos del catálogo
-- (por ejemplo `catalogo_local`, indicada en CATALOG_DB_NAME) o en `portfolio`.
-- No modifica las tablas existentes. Todos los datos son ficticios.

CREATE TABLE catalog_categories (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    slug VARCHAR(80) NOT NULL,
    name VARCHAR(80) NOT NULL,
    display_order INT NOT NULL DEFAULT 0,
    PRIMARY KEY (id),
    UNIQUE KEY uq_catalog_categories_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE catalog_products (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    slug VARCHAR(120) NOT NULL,
    category_id INT UNSIGNED NOT NULL,
    name VARCHAR(160) NOT NULL,
    description VARCHAR(255) NOT NULL,
    price_cents INT UNSIGNED NOT NULL,
    accent VARCHAR(20) NOT NULL,
    label VARCHAR(40) NOT NULL,
    is_published TINYINT(1) NOT NULL DEFAULT 1,
    display_order INT NOT NULL DEFAULT 0,
    PRIMARY KEY (id),
    UNIQUE KEY uq_catalog_products_slug (slug),
    KEY idx_catalog_products_category (category_id),
    CONSTRAINT fk_catalog_products_category
        FOREIGN KEY (category_id) REFERENCES catalog_categories (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO catalog_categories (id, slug, name, display_order) VALUES
    (1, 'verduras', 'Verduras', 1),
    (2, 'legumbres', 'Legumbres', 2),
    (3, 'frutas', 'Frutas', 3);

INSERT INTO catalog_products (slug, category_id, name, description, price_cents, accent, label, display_order) VALUES
    ('piquillos-asados', 1, 'Pimientos del piquillo asados', 'Pimientos asados y conservados en su jugo.', 590, 'red', 'Piquillos', 1),
    ('esparragos-blancos', 1, 'Espárragos blancos', 'Espárragos enteros en conserva, formato de muestra.', 650, 'green', 'Espárragos', 2),
    ('alcachofas', 1, 'Alcachofas al natural', 'Corazones de alcachofa en conserva.', 520, 'olive', 'Alcachofa', 3),
    ('menestra', 1, 'Menestra de la huerta', 'Selección de verduras para una menestra de ejemplo.', 690, 'yellow', 'Menestra', 4),
    ('pochas', 2, 'Pochas guisadas', 'Alubias pochas en una receta ficticia de la casa.', 480, 'cream', 'Pochas', 5),
    ('melocoton', 3, 'Melocotón en almíbar', 'Mitades de melocotón en almíbar ligero.', 450, 'peach', 'Melocotón', 6);
