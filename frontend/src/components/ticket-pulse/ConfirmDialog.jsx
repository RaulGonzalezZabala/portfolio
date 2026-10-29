function ConfirmDialog({ eventName, onCancel, onConfirm }) {
  return (
    <div className="ticket-dialog-backdrop" role="presentation">
      <section className="ticket-dialog" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
        <h2 id="confirm-title">¿Eliminar esta venta?</h2>
        <p>Eliminarás <strong>{eventName}</strong> de este navegador.</p>
        <div className="ticket-dialog-actions">
          <button className="ticket-button-secondary" type="button" onClick={onCancel}>Cancelar</button>
          <button className="ticket-button-danger" type="button" onClick={onConfirm}>Eliminar</button>
        </div>
      </section>
    </div>
  )
}

export default ConfirmDialog