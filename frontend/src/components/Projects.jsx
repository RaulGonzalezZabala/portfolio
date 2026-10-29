import ProjectCard from './ProjectCard'

const ticketPulseProject = {
  id: 'ticket-pulse',
  title: 'TicketPulse',
  shortDescription: 'Aplicación full-stack para guardar ventas de entradas y controlar su apertura.',
  isFeatured: true,
  internalPath: '#/ticket-pulse',
  technologies: [
    { name: 'React', slug: 'react' },
    { name: 'PHP', slug: 'php' },
    { name: 'MySQL', slug: 'mysql' },
    { name: 'REST API', slug: 'rest-api' },
  ],
}

function Projects({ projects, isLoading, error, selectedProjectSlug, onSelectProject }) {
  return (
    <section className="section" id="proyectos" aria-labelledby="projects-title">
      <div className="container">
        <p className="eyebrow">Proyectos</p>
        <h2 id="projects-title">Ejemplos de trabajo</h2>
        <p className="section-intro">Los proyectos visibles se cargan desde la API del portfolio.</p>
        {isLoading && <p role="status">Cargando proyectos...</p>}
        {error && <p className="message-error" role="alert">{error}</p>}
        <div className="project-grid">
          <ProjectCard project={ticketPulseProject} />
          {!isLoading && !error && projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              isSelected={project.slug === selectedProjectSlug}
              onSelect={onSelectProject}
            />
          ))}
        </div>
        {!isLoading && !error && projects.length === 0 && <p>No hay más proyectos publicados todavía.</p>}
      </div>
    </section>
  )
}

export default Projects
