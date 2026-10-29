import { apiBaseUrl } from './api'
import { getCsrfToken, setCsrfToken } from './sessionSecurity'

async function request(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  const currentCsrfToken = getCsrfToken()

  if (currentCsrfToken) {
    headers['X-CSRF-Token'] = currentCsrfToken
  }

  const response = await fetch(`${apiBaseUrl}${path}`, {
    credentials: 'include',
    ...options,
    headers,
  })

  const payload = response.status === 204 ? null : await response.json()

  if (payload?.data?.csrfToken) {
    setCsrfToken(payload.data.csrfToken)
  }

  if (!response.ok) {
    throw new Error(payload?.error?.message ?? 'No se ha podido completar la solicitud.')
  }

  return payload?.data ?? null
}

export function getCurrentUser() {
  return request('/auth/me')
}

export function register(email, password, termsAccepted, privacyAccepted) {
  return request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, termsAccepted, privacyAccepted }),
  })
}

export function login(email, password) {
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

export function verifyEmail(token) {
  return request('/auth/verify', {
    method: 'POST',
    body: JSON.stringify({ token }),
  })
}

export function resendVerification(email) {
  return request('/auth/resend-verification', {
    method: 'POST',
    body: JSON.stringify({ email }),
  })
}

export function requestPasswordReset(email) {
  return request('/auth/password-reset/request', {
    method: 'POST',
    body: JSON.stringify({ email }),
  })
}

export function resetPassword(token, password) {
  return request('/auth/password-reset/confirm', {
    method: 'POST',
    body: JSON.stringify({ token, password }),
  })
}

export function logout() {
  return request('/auth/logout', { method: 'POST' })
}
