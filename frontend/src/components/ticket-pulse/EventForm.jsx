import { useEffect, useState } from 'react'
import { timezones, validateEventForm } from '../../utils/ticketPulseValidation'
import { createSaleStartAt, formatInputDate, formatInputTime } from '../../utils/ticketPulseDates'

const emptyForm = {
  name: '',
  url: '',
  date: '',
  time: '',
  timezone: 'Europe/Madrid',
  notes: '',
}

function getFormValues(event) {
  if (!event) {
    return emptyForm
  }

  return {
    name: event.name,
    url: event.url,
    date: formatInputDate(event.saleStartAt, event.timezone),
    time: formatInputTime(event.saleStartAt, event.timezone),
    timezone: event.timezone,
    notes: event.notes,
  }
}

function EventForm({ event, onCancel, onSubmit }) {
  const [values, setValues] = useState(getFormValues(event))
  const [errors, setErrors] = useState({})

  useEffect(() => {
    setValues(getFormValues(event))
    setErrors({})
  }, [event])

  function handleChange(event) {
    const { name, value, checked, type } = event.target
    setValues((currentValues) => ({
      ...currentValues,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  function handleSubmit(submitEvent) {
    submitEvent.preventDefault()
    const validationErrors = validateEventForm(values)

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    onSubmit({
      name: values.name.trim(),
      url: values.url.trim(),
      saleStartAt: createSaleStartAt(values.date, values.time, values.timezone),
      timezone: values.timezone,
      notes: values.notes.trim(),
    })
  }

  return (
    <section className="ticket-form-panel" aria-labelledby="event-form-title">
      <div className="ticket-form-heading">
        <div>
          <p className="ticket-kicker">{event ? 'Editar venta' : 'Nueva venta'}</p>
          <h2 id="event-form-title">{event ? event.name : 'Configura un aviso'}</h2>
        </div>
        <button className="ticket-icon-button" type="button" onClick={onCancel} aria-label="Cerrar formulario">×</button>
      </div>
      <form className="ticket-form" onSubmit={handleSubmit} noValidate>
        <label>
          Nombre del evento
          <input name="name" value={values.name} onChange={handleChange} aria-invalid={Boolean(errors.name)} />
          {errors.name && <span className="ticket-field-error">{errors.name}</span>}
        </label>
        <label>
          URL de compra
          <input name="url" type="url" placeholder="https://..." value={values.url} onChange={handleChange} aria-invalid={Boolean(errors.url)} />
          {errors.url && <span className="ticket-field-error">{errors.url}</span>}
        </label>
        <div className="ticket-form-grid">
          <label>
            Fecha
            <input name="date" type="date" value={values.date} onChange={handleChange} aria-invalid={Boolean(errors.saleStartAt)} />
          </label>
          <label>
            Hora
            <input name="time" type="time" value={values.time} onChange={handleChange} aria-invalid={Boolean(errors.saleStartAt)} />
          </label>
        </div>
        {errors.saleStartAt && <span className="ticket-field-error">{errors.saleStartAt}</span>}
        <label>
          Zona horaria
          <select name="timezone" value={values.timezone} onChange={handleChange} aria-invalid={Boolean(errors.timezone)}>
            <option value="">Selecciona una zona</option>
            {timezones.map((timezone) => <option key={timezone} value={timezone}>{timezone}</option>)}
          </select>
          {errors.timezone && <span className="ticket-field-error">{errors.timezone}</span>}
        </label>
        <label>
          Notas <span className="ticket-optional">opcional</span>
          <textarea name="notes" rows="3" value={values.notes} onChange={handleChange} />
        </label>
        <div className="ticket-form-actions">
          <button className="ticket-button-secondary" type="button" onClick={onCancel}>Cancelar</button>
          <button className="ticket-button" type="submit">{event ? 'Guardar cambios' : 'Guardar venta'}</button>
        </div>
      </form>
    </section>
  )
}

export default EventForm