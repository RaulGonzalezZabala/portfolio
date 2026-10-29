import { useEffect, useRef, useState } from 'react'
import ticketPulseLogo from '../assets/ticket-pulse/logo.png'
import AuthPanel from '../components/ticket-pulse/AuthPanel'
import ConfirmDialog from '../components/ticket-pulse/ConfirmDialog'
import EmptyState from '../components/ticket-pulse/EmptyState'
import EventCard from '../components/ticket-pulse/EventCard'
import EventForm from '../components/ticket-pulse/EventForm'
import { useCurrentTime } from '../hooks/useCurrentTime'
import { useAuth } from '../hooks/useAuth'
import { useTicketEvents } from '../hooks/useTicketEvents'
import { getEventStatus } from '../utils/ticketPulseDates'

function TicketPulsePage() {
  const currentTime = useCurrentTime()
  const {
    user,
    isLoading: isAuthLoading,
    loadError: authLoadError,
    signIn,
    signUp,
    signOut,
    verifyEmailAddress,
    resendVerificationEmail,
    sendPasswordReset,
    changePassword,
  } = useAuth()
  const { events, isLoading, apiError, createEvent, updateEvent, removeEvent, markEventFinished } = useTicketEvents(Boolean(user))
  const authQuery = new URLSearchParams(window.location.hash.split('?')[1] ?? '')
  const [editingEvent, setEditingEvent] = useState(undefined)
  const [eventToDelete, setEventToDelete] = useState(null)
  const [notice, setNotice] = useState('')
  const [notificationPermission, setNotificationPermission] = useState(
    'Notification' in window ? Notification.permission : 'unsupported',
  )
  const [isNotificationPromptOpen, setIsNotificationPromptOpen] = useState(
    'Notification' in window && Notification.permission === 'default',
  )
  const previousStatuses = useRef(new Map())

  useEffect(() => {
    events.forEach((event) => {
      const status = getEventStatus(event, currentTime)
      const previousStatus = previousStatuses.current.get(event.id)

      if (status === 'active' && previousStatus === 'pending') {
        setNotice(`La venta de ${event.name} ya está activa. Vuelve a la pestaña del evento que preparaste.`)

        if ('Notification' in window && Notification.permission === 'granted') {
          try {
            const notification = new Notification('La venta ya está activa', {
              body: `${event.name}: pulsa aquí para volver a TicketPulse y abrir el evento.`,
              tag: `ticket-pulse-${event.id}`,
            })

            notification.onclick = () => {
              const eventWindow = window.open(event.url, '_blank')

              if (!eventWindow) {
                setNotice(`Chrome bloqueó la apertura de ${event.name}. Permite ventanas emergentes para TicketPulse.`)
              }

              notification.close()
            }
          } catch (error) {
            setNotice(`No se pudo mostrar la notificación: ${error.message}`)
          }
        }
      }

      previousStatuses.current.set(event.id, status)
    })
  }, [events, currentTime])

  async function handleEnableNotifications() {
    setIsNotificationPromptOpen(false)

    if (!('Notification' in window)) {
      setNotificationPermission('unsupported')
      setNotice('Este navegador no admite notificaciones de escritorio.')
      return
    }

    try {
      const permission = await Notification.requestPermission()
      setNotificationPermission(permission)
      setNotice(
        permission === 'granted'
          ? 'Avisos activados. Recibirás una notificación cuando empiece una venta mientras TicketPulse siga abierto.'
          : 'No se concedió el permiso. Puedes activarlo en los ajustes del sitio desde el navegador.',
      )
    } catch (error) {
      setNotice(`No se pudo activar las notificaciones: ${error.message}`)
    }
  }

  function closeForm() {
    setEditingEvent(undefined)
  }

  async function handleSubmit(eventData) {
    try {
      if (editingEvent?.id) {
        await updateEvent(editingEvent.id, eventData)
        setNotice('Los cambios se han guardado.')
      } else {
        await createEvent(eventData)
        setNotice('La venta se ha guardado.')
      }

      closeForm()
    } catch (error) {
      setNotice(error.message)
    }
  }

  async function handleDelete() {
    try {
      await removeEvent(eventToDelete.id)
      setNotice('La venta se ha eliminado.')
      setEventToDelete(null)
    } catch (error) {
      setNotice(error.message)
    }
  }

  async function handleFinish(id) {
    try {
      await markEventFinished(id)
      setNotice('La venta se ha marcado como finalizada.')
    } catch (error) {
      setNotice(error.message)
    }
  }

  async function handleSignOut() {
    try {
      await signOut()
      setNotice('')
    } catch (error) {
      setNotice(`No se pudo cerrar la sesión: ${error.message}`)
    }
  }

  function handleOpenEventWindow(event) {
    const eventWindow = window.open(
      event.url,
      '_blank',
      'popup,width=1100,height=800,resizable=yes,scrollbars=yes',
    )

    if (!eventWindow) {
      setNotice('Chrome ha bloqueado la ventana. Permite ventanas emergentes para este sitio o usa «Abrir en pestaña».')
      return
    }

    eventWindow.opener = null
    eventWindow.focus()
  }

  return (
    <main className="ticket-pulse-app">
      <header className="ticket-topbar">
        <a className="ticket-brand" href="#/" aria-label="Volver al portfolio">
          <img src={ticketPulseLogo} alt="" />
        </a>
        <a className="ticket-back-link" href="#/">Volver al portfolio</a>
      </header>
      {isAuthLoading ? (
        <p className="ticket-notice ticket-auth-loading" role="status">Comprobando tu sesión...</p>
      ) : !user ? (
        <>
          {authLoadError && <p className="ticket-notice ticket-notice-error ticket-auth-loading" role="alert">{authLoadError}</p>}
          <AuthPanel
            onLogin={signIn}
            onRegister={signUp}
            onRequestPasswordReset={sendPasswordReset}
            onResetPassword={changePassword}
            onResendVerification={resendVerificationEmail}
            onVerifyEmail={verifyEmailAddress}
            verificationToken={authQuery.get('verify')}
            passwordResetToken={authQuery.get('reset')}
          />
        </>
      ) : (
        <>
      <div className="ticket-account-bar">
        <span>Sesión iniciada como <strong>{user.email}</strong></span>
        <button className="ticket-button-secondary" type="button" onClick={handleSignOut}>Cerrar sesión</button>
      </div>
      <section className="ticket-hero" aria-labelledby="ticket-title">
        <div>
          <p className="ticket-kicker">Control de ventas</p>
          <h1 id="ticket-title">No pierdas la salida.</h1>
          <p>Prepara el acceso a la página del evento con antelación y recibe un aviso cuando se active la venta. Deja esa pestaña abierta.</p>
        </div>
        <button className="ticket-button" type="button" onClick={() => setEditingEvent(null)}>Añadir venta</button>
      </section>
      <section className="ticket-content" aria-labelledby="ticket-events-title">
        <div className="ticket-section-heading">
          <div>
            <p className="ticket-kicker">Próximas ventas</p>
            <h2 id="ticket-events-title">Tu radar de entradas</h2>
          </div>
          <span className="ticket-event-count">{events.length} guardadas</span>
        </div>
        {notificationPermission === 'default' && (
          <div className="ticket-notification-prompt">
            <p>Activa los avisos para enterarte cuando empiece una venta, aunque estés en otra pestaña.</p>
            <button className="ticket-button-secondary" type="button" onClick={handleEnableNotifications}>
              Activar notificaciones
            </button>
          </div>
        )}
        {notificationPermission === 'denied' && (
          <p className="ticket-notice ticket-notice-error" role="status">
            Las notificaciones están bloqueadas. Puedes permitirlas desde los ajustes del sitio en el navegador.
          </p>
        )}
        {notificationPermission === 'unsupported' && (
          <p className="ticket-notice" role="status">
            Este navegador no admite notificaciones de escritorio.
          </p>
        )}
        {apiError && <p className="ticket-notice ticket-notice-error" role="alert">{apiError}</p>}
        {notice && <p className="ticket-notice" role="status">{notice}</p>}
        {isLoading ? (
          <p className="ticket-notice" role="status">Cargando ventas...</p>
        ) : events.length === 0 ? (
          <EmptyState onCreate={() => setEditingEvent(null)} />
        ) : (
          <div className="ticket-event-grid">
            {events
              .slice()
              .sort((firstEvent, secondEvent) => new Date(firstEvent.saleStartAt) - new Date(secondEvent.saleStartAt))
              .map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  currentTime={currentTime}
                  status={getEventStatus(event, currentTime)}
                  onEdit={setEditingEvent}
                  onDelete={setEventToDelete}
                  onFinish={handleFinish}
                  onOpenEventWindow={handleOpenEventWindow}
                />
              ))}
          </div>
        )}
      </section>
      {editingEvent !== undefined && <EventForm event={editingEvent} onCancel={closeForm} onSubmit={handleSubmit} />}
      {eventToDelete && <ConfirmDialog eventName={eventToDelete.name} onCancel={() => setEventToDelete(null)} onConfirm={handleDelete} />}
        </>
      )}
      {user && isNotificationPromptOpen && notificationPermission === 'default' && (
        <div className="ticket-dialog-backdrop">
          <section className="ticket-dialog" role="dialog" aria-modal="true" aria-labelledby="notification-title">
            <h2 id="notification-title">¿Quieres recibir avisos?</h2>
            <p>TicketPulse puede avisarte cuando empiece una venta. Al continuar, Chrome te preguntará si permites las notificaciones.</p>
            <div className="ticket-dialog-actions">
              <button
                className="ticket-button-secondary"
                type="button"
                onClick={() => setIsNotificationPromptOpen(false)}
              >
                Ahora no
              </button>
              <button className="ticket-button" type="button" onClick={handleEnableNotifications}>
                Continuar
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  )
}

export default TicketPulsePage