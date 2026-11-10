import { formatPrice } from '../utils/formatPrice'

const statusLabels = {
  pending: 'Sin pagar',
  paid: 'Pagado',
}

const dateFormatter = new Intl.DateTimeFormat('es-ES', { dateStyle: 'medium', timeStyle: 'short' })

function OrderHistory({ orders, isLoading, error, onBack, onInvoice }) {
  return (
    <section className="catalog-panel" aria-labelledby="catalog-orders-title">
      <p className="catalog-eyebrow">Tu cuenta</p>
      <h2 id="catalog-orders-title">Mis pedidos</h2>

      {isLoading && <p role="status">Cargando pedidos...</p>}
      {error && <p className="catalog-notice catalog-notice-error" role="alert">{error}</p>}
      {!isLoading && !error && orders.length === 0 && <p>Todavía no has hecho ningún pedido.</p>}

      <ul className="catalog-order-list">
        {orders.map((order) => (
          <li className="catalog-order" key={order.id}>
            <div className="catalog-order-heading">
              <span>{dateFormatter.format(new Date(order.createdAt.replace(' ', 'T') + 'Z'))}</span>
              <span className={`catalog-order-status catalog-order-status-${order.status}`}>
                {statusLabels[order.status] ?? order.status}
              </span>
            </div>
            <ul>
              {order.items.map((item) => (
                <li key={item.name}>{item.quantity} × {item.name} · {formatPrice(item.unitPrice)}</li>
              ))}
            </ul>
            <strong>Total: {formatPrice(order.total)}</strong>
            {order.status === 'paid' && (
              <button className="catalog-link-button catalog-invoice-link" type="button" onClick={() => onInvoice(order.id)}>
                Ver factura de prueba
              </button>
            )}
          </li>
        ))}
      </ul>

      <button className="catalog-link-button" type="button" onClick={onBack}>Volver a la tienda</button>
    </section>
  )
}

export default OrderHistory
