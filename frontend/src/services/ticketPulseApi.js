import { apiBaseUrl } from './api'
import { getCsrfToken } from './sessionSecurity'

async function request(path, options = {}) {
  const csrfToken = getCsrfToken()
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  if (csrfToken) {
    headers['X-CSRF-Token'] = csrfToken
  }

  const response = await fetch(`${apiBaseUrl}${path}`, {
    credentials: 'include',
    ...options,
    headers,
  })

  if (response.status === 204) {
    return null
  }

  const payload = await response.json()

  if (!response.ok) {
    throw new Error(payload.error?.message ?? 'No se ha podido completar la solicitud.')
  }

  return payload.data
}

export function getTicketEvents() {
  return request('/ticket-events')
}

export function createTicketEvent(event) {
  return request('/ticket-events', {
    method: 'POST',
    body: JSON.stringify(event),
  })
}

export function updateTicketEvent(id, event) {
  return request(`/ticket-events/${id}`, {
    method: 'PUT',
    body: JSON.stringify(event),
  })
}

export function deleteTicketEvent(id) {
  return request(`/ticket-events/${id}`, { method: 'DELETE' })
}