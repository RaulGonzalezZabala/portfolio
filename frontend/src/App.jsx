import { useEffect, useState } from 'react'
import About from './components/About'
import Footer from './components/Footer'
import Header from './components/Header'
import Hero from './components/Hero'
import ProjectDetail from './components/ProjectDetail'
import Projects from './components/Projects'
import Skills from './components/Skills'
import { getProjects } from './services/api'

function App() {
  const [projects, setProjects] = useState([])
  const [selectedProject, setSelectedProject] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadProjects() {
      try {
        const apiProjects = await getProjects()
        setProjects(apiProjects)
        setSelectedProject(apiProjects[0] ?? null)
      } catch (loadError) {
        setError(loadError.message)
      } finally {
        setIsLoading(false)
      }
    }

    loadProjects()
  }, [])

  return (
    <>
      <Header />
      <main>
        <Hero />
        <About />
        <Skills />
        <Projects
          projects={projects}
          isLoading={isLoading}
          error={error}
          selectedProjectSlug={selectedProject?.slug}
          onSelectProject={setSelectedProject}
        />
        {selectedProject && <ProjectDetail project={selectedProject} />}
      </main>
      <Footer />
    </>
  )
}

export default App
