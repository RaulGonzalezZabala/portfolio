function ProjectCard({ project, isSelected, onSelect }) {
  return (
    <article className="project-card">
      <div className="project-card-content">
        {project.isFeatured && <p className="tag">Destacado</p>}
        <h3>{project.title}</h3>
        <p>{project.shortDescription}</p>
        <ul className="technology-list" aria-label={`Tecnologías de ${project.title}`}>
          {project.technologies.map((technology) => <li key={technology.slug}>{technology.name}</li>)}
        </ul>
        <button
          className="text-button"
          type="button"
          onClick={() => onSelect(project)}
          aria-pressed={isSelected}
        >
          {isSelected ? 'Viendo detalle' : 'Ver detalle'}
        </button>
      </div>
    </article>
  )
}

export default ProjectCard
