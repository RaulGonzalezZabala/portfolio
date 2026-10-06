<?php

declare(strict_types=1);

function findPublishedProjects(PDO $connection): array
{
    $statement = $connection->query(
        'SELECT
            projects.id,
            projects.slug,
            projects.title,
            projects.short_description,
            projects.description,
            projects.image_url,
            projects.demo_url,
            projects.repository_url,
            projects.is_featured,
            technologies.name AS technology_name,
            technologies.slug AS technology_slug
        FROM projects
        LEFT JOIN project_technologies ON project_technologies.project_id = projects.id
        LEFT JOIN technologies ON technologies.id = project_technologies.technology_id
        WHERE projects.is_published = 1
        ORDER BY projects.display_order ASC, projects.id ASC, technologies.name ASC'
    );

    return mapProjects($statement->fetchAll());
}

function findPublishedProjectBySlug(PDO $connection, string $slug): ?array
{
    $statement = $connection->prepare(
        'SELECT
            projects.id,
            projects.slug,
            projects.title,
            projects.short_description,
            projects.description,
            projects.image_url,
            projects.demo_url,
            projects.repository_url,
            projects.is_featured,
            technologies.name AS technology_name,
            technologies.slug AS technology_slug
        FROM projects
        LEFT JOIN project_technologies ON project_technologies.project_id = projects.id
        LEFT JOIN technologies ON technologies.id = project_technologies.technology_id
        WHERE projects.slug = :slug AND projects.is_published = 1
        ORDER BY technologies.name ASC'
    );
    $statement->execute(['slug' => $slug]);

    $projects = mapProjects($statement->fetchAll());

    return $projects[0] ?? null;
}

function mapProjects(array $rows): array
{
    $projectsById = [];

    foreach ($rows as $row) {
        $projectId = (int) $row['id'];

        if (!isset($projectsById[$projectId])) {
            $projectsById[$projectId] = [
                'id' => $projectId,
                'slug' => $row['slug'],
                'title' => $row['title'],
                'shortDescription' => $row['short_description'],
                'description' => $row['description'],
                'imageUrl' => $row['image_url'],
                'demoUrl' => $row['demo_url'],
                'repositoryUrl' => $row['repository_url'],
                'isFeatured' => (bool) $row['is_featured'],
                'technologies' => [],
            ];
        }

        if ($row['technology_name'] !== null) {
            $projectsById[$projectId]['technologies'][] = [
                'name' => $row['technology_name'],
                'slug' => $row['technology_slug'],
            ];
        }
    }

    return array_values($projectsById);
}
