function ProjectDetail({ project }) {
  return (
    <section className="section detail-section" aria-labelledby="project-detail-title">
      <div className="container narrow-content detail-card">
        <p className="eyebrow">Detalle del proyecto</p>
        <h2 id="project-detail-title">{project.title}</h2>
        <p>{project.description}</p>
        <a className="text-link" href="#proyectos">Volver al listado</a>
      </div>
    </section>
  )
}

export default ProjectDetail
