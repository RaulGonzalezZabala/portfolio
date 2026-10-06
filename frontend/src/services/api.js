export const apiBaseUrl = import.meta.env.VITE_API_BASE_URL

export async function getProjects() {
	const response = await fetch(`${apiBaseUrl}/projects`)

	if (!response.ok) {
		throw new Error('No se han podido cargar los proyectos.')
	}

	const payload = await response.json()

	return payload.data
}
