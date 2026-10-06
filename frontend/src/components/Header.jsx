function Header() {
  return (
    <header className="site-header">
      <div className="container header-content">
        <a className="brand" href="#inicio" aria-label="Ir al inicio">
          <span aria-hidden="true">&lt;/&gt;</span> Portfolio
        </a>
        <nav aria-label="Navegación principal">
          <ul className="nav-list">
            <li><a href="#sobre-mi">Sobre mí</a></li>
            <li><a href="#tecnologias">Tecnologías</a></li>
            <li><a href="#proyectos">Proyectos</a></li>
            <li><a href="#contacto">Contacto</a></li>
          </ul>
        </nav>
      </div>
    </header>
  )
}

export default Header
