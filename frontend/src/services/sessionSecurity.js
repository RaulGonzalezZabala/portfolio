let csrfToken = ''

export function getCsrfToken() {
  return csrfToken
}

export function setCsrfToken(token) {
  if (typeof token === 'string' && token !== '') {
    csrfToken = token
  }
}
