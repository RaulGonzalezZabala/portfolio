import { useEffect, useState } from 'react'
import About from './components/About'
import Footer from './components/Footer'
import Header from './components/Header'
import Hero from './components/Hero'
import ProjectDetail from './components/ProjectDetail'
import Projects from './components/Projects'
import Skills from './components/Skills'
import TicketPulsePage from './pages/TicketPulsePage'
import { getProjects } from './services/api'

function App() {
  const [isTicketPulse, setIsTicketPulse] = useState(window.location.hash.split('?')[0] === '#/ticket-pulse')
  const [projects, setProjects] = useState([])
  const [selectedProject, setSelectedProject] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    function updateRoute() {
      setIsTicketPulse(window.location.hash.split('?')[0] === '#/ticket-pulse')
    }

    window.addEventListener('hashchange', updateRoute)

    return () => window.removeEventListener('hashchange', updateRoute)
  }, [])

  useEffect(() => {
    if (isTicketPulse) {
      return undefined
    }

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
  }, [isTicketPulse])

  if (isTicketPulse) {
    return <TicketPulsePage />
  }

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
