import { useEffect, useState } from 'react'
import About from './components/About'
import Footer from './components/Footer'
import Header from './components/Header'
import Hero from './components/Hero'
import ProjectDetail from './components/ProjectDetail'
import Projects from './components/Projects'
import Skills from './components/Skills'
import CatalogPage from './examples/catalogo-local/CatalogPage'
import TicketPulsePage from './pages/TicketPulsePage'
import { getProjects } from './services/api'

function getRoute() {
  const hash = window.location.hash.split('?')[0]

  return hash === '#/ticket-pulse' || hash === '#/catalogo-local'
    ? hash
    : 'portfolio'
}

function App() {
  const [route, setRoute] = useState(getRoute)
  const [projects, setProjects] = useState([])
  const [selectedProject, setSelectedProject] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    function updateRoute() {
      setRoute(getRoute())
    }

    window.addEventListener('hashchange', updateRoute)

    return () => window.removeEventListener('hashchange', updateRoute)
  }, [])

  useEffect(() => {
    if (route !== 'portfolio') {
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
  }, [route])

  if (route === '#/ticket-pulse') {
    return <TicketPulsePage />
  }

  if (route === '#/catalogo-local') {
    return <CatalogPage />
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
