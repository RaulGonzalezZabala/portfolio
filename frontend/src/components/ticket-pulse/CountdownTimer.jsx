import { formatCountdown, getTimeRemaining } from '../../utils/ticketPulseDates'

function CountdownTimer({ saleStartAt, currentTime, status }) {
  if (status === 'finished') {
    return <p className="ticket-countdown ticket-countdown-finished">Venta finalizada</p>
  }

  if (status === 'error') {
    return <p className="ticket-countdown ticket-countdown-finished">No se ha podido leer la fecha</p>
  }

  if (status === 'active') {
    return <p className="ticket-countdown ticket-countdown-active">La venta está activa</p>
  }

  const timeRemaining = getTimeRemaining(saleStartAt, currentTime)

  return (
    <p className="ticket-countdown" aria-label={`Faltan ${formatCountdown(timeRemaining)} para la apertura`}>
      {formatCountdown(timeRemaining)}
    </p>
  )
}

export default CountdownTimer