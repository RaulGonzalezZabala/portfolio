function Footer() {
  return (
    <footer className="site-footer" id="contacto">
      <div className="container footer-content">
        <div>
          <p className="eyebrow">Contacto</p>
          <h2>Hablemos de tu próximo proyecto.</h2>
        </div>
        <ul className="contact-list">
          <li><a href="mailto:tu-email@ejemplo.com">Email</a></li>
          <li><a href="https://github.com/tu-usuario" target="_blank" rel="noreferrer">GitHub</a></li>
          <li><a href="https://www.linkedin.com/in/tu-usuario" target="_blank" rel="noreferrer">LinkedIn</a></li>
        </ul>
      </div>
    </footer>
  )
}

export default Footer
