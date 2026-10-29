function EmptyState({ onCreate }) {
  return (
    <section className="ticket-empty-state" aria-labelledby="empty-title">
      <div className="ticket-empty-icon" aria-hidden="true">+</div>
      <h2 id="empty-title">Aún no tienes ventas guardadas</h2>
      <p>Guarda un enlace, prepara su acceso antes de la venta y TicketPulse te avisará cuando llegue la hora.</p>
      <button className="ticket-button" type="button" onClick={onCreate}>Añadir mi primera venta</button>
    </section>
  )
}

export default EmptyState