import { useEffect, useRef, useState } from 'react'

function AuthPanel({
  onLogin,
  onRegister,
  onRequestPasswordReset,
  onResetPassword,
  onResendVerification,
  onVerifyEmail,
  verificationToken,
  passwordResetToken,
}) {
  const [mode, setMode] = useState(passwordResetToken ? 'reset' : verificationToken ? 'verify' : 'login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [privacyAccepted, setPrivacyAccepted] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const verificationStarted = useRef('')

  useEffect(() => {
    if (!verificationToken || verificationStarted.current === verificationToken) {
      return
    }

    verificationStarted.current = verificationToken
    setMode('verify')
    setIsSubmitting(true)
    onVerifyEmail(verificationToken)
      .then((result) => setMessage(result.message))
      .catch((verifyError) => setError(verifyError.message))
      .finally(() => setIsSubmitting(false))
  }, [verificationToken])

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setMessage('')
    setIsSubmitting(true)

    try {
      if (mode === 'login') {
        await onLogin(email, password)
      } else if (mode === 'register') {
        const result = await onRegister(email, password, termsAccepted, privacyAccepted)
        setMessage(result.message)
      } else if (mode === 'request-reset') {
        const result = await onRequestPasswordReset(email)
        setMessage(result.message)
      } else if (mode === 'resend-verification') {
        const result = await onResendVerification(email)
        setMessage(result.message)
      } else if (mode === 'reset') {
        const result = await onResetPassword(passwordResetToken, password)
        setMessage(result.message)
        setPassword('')
        setMode('login')
      }
    } catch (submitError) {
      setError(submitError.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const titles = {
    login: 'Inicia sesión',
    register: 'Crea tu cuenta',
    'request-reset': 'Recupera tu contraseña',
    'resend-verification': 'Reenvía la verificación',
    reset: 'Elige una contraseña nueva',
    verify: 'Verifica tu correo',
  }

  return (
    <section className="ticket-auth-panel" aria-labelledby="ticket-auth-title">
      <p className="ticket-kicker">Tu radar personal</p>
      <h1 id="ticket-auth-title">{titles[mode]}</h1>
      <p className="ticket-auth-intro">Solo necesitamos tu email para asociar tus eventos a tu cuenta.</p>
      {mode === 'verify' ? (
        <>
          {isSubmitting && <p className="ticket-notice" role="status">Verificando el enlace...</p>}
          {message && <p className="ticket-notice" role="status">{message}</p>}
          {error && <p className="ticket-notice ticket-notice-error" role="alert">{error}</p>}
          <button className="ticket-auth-switch" type="button" onClick={() => { setMode('login'); setError(''); setMessage('') }}>
            Ir a iniciar sesión
          </button>
        </>
      ) : (
        <>
          <form className="ticket-form" onSubmit={handleSubmit} noValidate>
            {mode !== 'reset' && (
              <label>
                Email
                <input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
              </label>
            )}
            {(mode === 'login' || mode === 'register' || mode === 'reset') && (
              <label>
                Contraseña
                <input
                  type="password"
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  minLength="12"
                  required
                />
                {mode !== 'login' && <span className="ticket-field-help">Entre 12 y 72 bytes.</span>}
              </label>
            )}
            {mode === 'register' && (
              <div className="ticket-policy-checks">
                <label className="ticket-check-label">
                  <input type="checkbox" checked={termsAccepted} onChange={(event) => setTermsAccepted(event.target.checked)} required />
                  <span>Acepto los <a href="/legal/terms.html" target="_blank" rel="noreferrer">términos de uso</a>.</span>
                </label>
                <label className="ticket-check-label">
                  <input type="checkbox" checked={privacyAccepted} onChange={(event) => setPrivacyAccepted(event.target.checked)} required />
                  <span>Acepto la <a href="/legal/privacy.html" target="_blank" rel="noreferrer">política de privacidad</a>.</span>
                </label>
              </div>
            )}
            {error && <p className="ticket-notice ticket-notice-error" role="alert">{error}</p>}
            {message && <p className="ticket-notice" role="status">{message}</p>}
            <button className="ticket-button" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Procesando...' : mode === 'login' ? 'Entrar' : mode === 'register' ? 'Crear cuenta' : mode === 'reset' ? 'Cambiar contraseña' : 'Enviar instrucciones'}
            </button>
          </form>
          <div className="ticket-auth-links">
            {mode === 'login' && (
              <>
                <button className="ticket-auth-switch" type="button" onClick={() => { setMode('request-reset'); setError(''); setMessage('') }}>He olvidado mi contraseña</button>
                <button className="ticket-auth-switch" type="button" onClick={() => { setMode('resend-verification'); setError(''); setMessage('') }}>Reenviar verificación de correo</button>
                <button className="ticket-auth-switch" type="button" onClick={() => { setMode('register'); setError(''); setMessage('') }}>¿Todavía no tienes cuenta? Crear una</button>
              </>
            )}
            {mode !== 'login' && mode !== 'verify' && (
              <button className="ticket-auth-switch" type="button" onClick={() => { setMode('login'); setError(''); setMessage('') }}>Volver a iniciar sesión</button>
            )}
          </div>
        </>
      )}
    </section>
  )
}

export default AuthPanel
