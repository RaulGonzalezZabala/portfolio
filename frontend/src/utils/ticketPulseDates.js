import { formatInTimeZone, fromZonedTime } from 'date-fns-tz'
import { es } from 'date-fns/locale'

export function createSaleStartAt(date, time, timezone) {
  return fromZonedTime(`${date}T${time}:00`, timezone).toISOString()
}

export function getTimeRemaining(saleStartAt, currentTime = Date.now()) {
  const saleStartTime = new Date(saleStartAt).getTime()
  const totalSeconds = Number.isNaN(saleStartTime)
    ? 0
    : Math.max(0, Math.floor((saleStartTime - currentTime) / 1000))

  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
    totalSeconds,
  }
}

export function getEventStatus(event, currentTime = Date.now()) {
  if (event.status === 'error' || event.status === 'finished') {
    return event.status
  }

  const saleStartTime = new Date(event.saleStartAt).getTime()

  if (Number.isNaN(saleStartTime)) {
    return 'error'
  }

  return saleStartTime <= currentTime ? 'active' : 'pending'
}

export function formatSaleStartAt(saleStartAt, timezone) {
  try {
    return formatInTimeZone(saleStartAt, timezone, "d 'de' MMMM 'de' yyyy, HH:mm zzz", {
      locale: es,
    })
  } catch {
    return 'Fecha de venta no válida'
  }
}

export function formatInputDate(saleStartAt, timezone) {
  return formatInTimeZone(saleStartAt, timezone, 'yyyy-MM-dd')
}

export function formatInputTime(saleStartAt, timezone) {
  return formatInTimeZone(saleStartAt, timezone, 'HH:mm')
}

export function formatCountdown(timeRemaining) {
  const pad = (value) => String(value).padStart(2, '0')

  return `${timeRemaining.days}d ${pad(timeRemaining.hours)}h ${pad(timeRemaining.minutes)}m ${pad(timeRemaining.seconds)}s`
}