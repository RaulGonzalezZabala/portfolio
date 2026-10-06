import { skills } from '../data/skills'

function Skills() {
  return (
    <section className="section section-muted" id="tecnologias" aria-labelledby="skills-title">
      <div className="container">
        <p className="eyebrow">Tecnologías</p>
        <h2 id="skills-title">Herramientas con las que trabajo</h2>
        <ul className="skills-list" aria-label="Tecnologías">
          {skills.map((skill) => <li key={skill}>{skill}</li>)}
        </ul>
      </div>
    </section>
  )
}

export default Skills
