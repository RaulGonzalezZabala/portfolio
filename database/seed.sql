-- Datos totalmente ficticios para desarrollo local.
-- No representan experiencia profesional, clientes reales ni métricas.
-- Importa este archivo después de schema.sql.

INSERT INTO technologies (id, name, slug) VALUES
    (1, 'React', 'react'),
    (2, 'JavaScript', 'javascript'),
    (3, 'PHP', 'php'),
    (4, 'HTML', 'html'),
    (5, 'CSS', 'css'),
    (6, 'MySQL', 'mysql');

INSERT INTO projects (
    id,
    slug,
    title,
    short_description,
    description,
    image_url,
    demo_url,
    repository_url,
    is_featured,
    is_published,
    display_order
) VALUES
    (
        1,
        'catalogo-local-ficticio',
        'Catálogo local ficticio',
        'Ejemplo ficticio de un catálogo para practicar componentes y filtros.',
        'Proyecto de demostración ficticio creado únicamente para probar una interfaz de catálogo. No corresponde a un producto, cliente ni experiencia profesional real.',
        NULL,
        NULL,
        NULL,
        1,
        1,
        1
    ),
    (
        2,
        'panel-tareas-ficticio',
        'Panel de tareas ficticio',
        'Ejemplo ficticio para practicar una interfaz de gestión de tareas.',
        'Proyecto de demostración ficticio utilizado para representar tarjetas, estados y organización de datos en la interfaz. No corresponde a una aplicación publicada.',
        NULL,
        NULL,
        NULL,
        0,
        1,
        2
    ),
    (
        3,
        'api-notas-ficticia',
        'API de notas ficticia',
        'Ejemplo no publicado para practicar endpoints de solo lectura.',
        'Proyecto de demostración ficticio y no publicado. Sirve para verificar que la API pública solo devuelve proyectos marcados como publicados.',
        NULL,
        NULL,
        NULL,
        0,
        0,
        3
    );

INSERT INTO project_technologies (project_id, technology_id) VALUES
    (1, 1),
    (1, 2),
    (1, 4),
    (1, 5),
    (2, 1),
    (2, 2),
    (2, 5),
    (3, 3),
    (3, 6);
