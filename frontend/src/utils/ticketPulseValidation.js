import { createSaleStartAt } from './ticketPulseDates'

export const timezones = [
  'Europe/Madrid',
  'Europe/London',
  'UTC',
  'America/New_York',
  'America/Los_Angeles',
]

export function validateEventForm(values) {
  const errors = {}

  if (!values.name.trim()) {
    errors.name = 'Escribe el nombre del evento.'
  }

  try {
    const parsedUrl = new URL(values.url)

    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      errors.url = 'La URL debe empezar por http:// o https://.'
    }
  } catch {
    errors.url = 'Escribe una URL de compra válida.'
  }

  if (!values.date || !values.time) {
    errors.saleStartAt = 'Indica la fecha y hora de apertura.'
  } else if (!values.timezone) {
    errors.timezone = 'Selecciona una zona horaria.'
  } else {
    try {
      if (new Date(createSaleStartAt(values.date, values.time, values.timezone)).getTime() <= Date.now()) {
        errors.saleStartAt = 'La apertura de venta debe ser una fecha futura.'
      }
    } catch {
      errors.saleStartAt = 'La fecha, hora o zona horaria no son válidas.'
    }
  }

  return errors
}