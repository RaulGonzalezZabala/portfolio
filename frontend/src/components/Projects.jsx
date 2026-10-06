import ProjectCard from './ProjectCard'

function Projects({ projects, isLoading, error, selectedProjectSlug, onSelectProject }) {
  return (
    <section className="section" id="proyectos" aria-labelledby="projects-title">
      <div className="container">
        <p className="eyebrow">Proyectos</p>
        <h2 id="projects-title">Ejemplos de trabajo</h2>
        <p className="section-intro">Los proyectos visibles se cargan desde la API del portfolio.</p>
        {isLoading && <p role="status">Cargando proyectos...</p>}
        {error && <p className="message-error" role="alert">{error}</p>}
        {!isLoading && !error && projects.length === 0 && <p>No hay proyectos publicados todavía.</p>}
        {!isLoading && !error && projects.length > 0 && (
          <div className="project-grid">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                isSelected={project.slug === selectedProjectSlug}
                onSelect={onSelectProject}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default Projects
