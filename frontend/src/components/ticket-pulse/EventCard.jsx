import CountdownTimer from './CountdownTimer'
import { formatSaleStartAt } from '../../utils/ticketPulseDates'

const statusLabels = {
  pending: 'Pendiente',
  active: 'Activa',
  finished: 'Finalizada',
  error: 'Error',
}

function EventCard({ event, currentTime, status, onEdit, onDelete, onFinish, onOpenEventWindow }) {
  return (
    <article className="ticket-event-card">
      <div className="ticket-event-card-header">
        <span className={`ticket-status ticket-status-${status}`}>{statusLabels[status]}</span>
      </div>
      <h2>{event.name}</h2>
      <a className="ticket-event-url" href={event.url} target="_blank" rel="noreferrer">{event.url}</a>
      <p className="ticket-sale-date">{formatSaleStartAt(event.saleStartAt, event.timezone)}</p>
      <p className="ticket-timezone">Zona horaria: {event.timezone}</p>
      <CountdownTimer saleStartAt={event.saleStartAt} currentTime={currentTime} status={status} />
      {event.notes && <p className="ticket-notes">{event.notes}</p>}
      <div className="ticket-event-actions">
        <a className="ticket-button" href={event.url} target="_blank" rel="noopener noreferrer">Abrir en pestaña</a>
        <button className="ticket-button-secondary" type="button" onClick={() => onOpenEventWindow(event)}>
          Abrir en ventana
        </button>
        <button className="ticket-button-secondary" type="button" onClick={() => onEdit(event)}>Editar</button>
        {status === 'active' && <button className="ticket-button-secondary" type="button" onClick={() => onFinish(event.id)}>Finalizar</button>}
        <button className="ticket-icon-button" type="button" onClick={() => onDelete(event)} aria-label={`Eliminar ${event.name}`}>×</button>
      </div>
    </article>
  )
}

export default EventCard