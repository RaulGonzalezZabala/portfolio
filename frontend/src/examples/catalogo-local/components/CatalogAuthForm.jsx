import { useState } from 'react'

function CatalogAuthForm({ onLogin, onRegister }) {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [privacyAccepted, setPrivacyAccepted] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setMessage('')
    setIsSubmitting(true)

    try {
      if (mode === 'login') {
        await onLogin(email, password)
      } else {
        const result = await onRegister(email, password, termsAccepted, privacyAccepted)
        setMessage(result.message)
      }
    } catch (submitError) {
      setError(submitError.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  function switchMode() {
    setMode(mode === 'login' ? 'register' : 'login')
    setError('')
    setMessage('')
  }

  return (
    <section className="catalog-panel" aria-labelledby="catalog-auth-title">
      <p className="catalog-eyebrow">Tu cuenta</p>
      <h2 id="catalog-auth-title">{mode === 'login' ? 'Inicia sesión para continuar' : 'Crea tu cuenta'}</h2>
      <p className="catalog-panel-intro">Necesitas una cuenta para tramitar y consultar tus pedidos.</p>

      <form className="catalog-form" onSubmit={handleSubmit} noValidate>
        <label>
          <span>Email</span>
          <input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
        </label>
        <label>
          <span>Contraseña</span>
          <input
            type="password"
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            minLength="12"
            required
          />
        </label>
        {mode === 'register' && (
          <>
            <label className="catalog-check">
              <input type="checkbox" checked={termsAccepted} onChange={(event) => setTermsAccepted(event.target.checked)} />
              <span>Acepto los <a href="/legal/terms.html" target="_blank" rel="noreferrer">términos de uso</a>.</span>
            </label>
            <label className="catalog-check">
              <input type="checkbox" checked={privacyAccepted} onChange={(event) => setPrivacyAccepted(event.target.checked)} />
              <span>Acepto la <a href="/legal/privacy.html" target="_blank" rel="noreferrer">política de privacidad</a>.</span>
            </label>
          </>
        )}
        {error && <p className="catalog-notice catalog-notice-error" role="alert">{error}</p>}
        {message && <p className="catalog-notice" role="status">{message}</p>}
        <button className="catalog-primary-button" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Procesando...' : mode === 'login' ? 'Entrar' : 'Crear cuenta'}
        </button>
      </form>

      <button className="catalog-link-button" type="button" onClick={switchMode}>
        {mode === 'login' ? '¿Todavía no tienes cuenta? Crear una' : 'Ya tengo cuenta: iniciar sesión'}
      </button>
    </section>
  )
}

export default CatalogAuthForm
