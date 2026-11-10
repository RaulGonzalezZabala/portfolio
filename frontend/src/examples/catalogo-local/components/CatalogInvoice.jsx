import { formatPrice } from '../utils/formatPrice'

const dateFormatter = new Intl.DateTimeFormat('es-ES', { dateStyle: 'medium', timeStyle: 'short' })

function CatalogInvoice({ invoice, isLoading, error, onBack }) {
  return (
    <section className="catalog-panel catalog-invoice-panel" aria-labelledby="catalog-invoice-title">
      {isLoading && <p role="status">Cargando factura de prueba...</p>}
      {error && <p className="catalog-notice catalog-notice-error" role="alert">{error}</p>}
      {invoice && (
        <article className="catalog-invoice">
          <p className="catalog-eyebrow">Despensa de aquí · Tienda ficticia</p>
          <h2 id="catalog-invoice-title">Factura de prueba</h2>
          <p className="catalog-invoice-warning">Documento ficticio sin validez fiscal. Pago realizado en modo de pruebas.</p>
          <p><strong>Referencia del pedido:</strong> {invoice.orderId}</p>
          {invoice.paidAt && (
            <p><strong>Fecha de pago:</strong> {dateFormatter.format(new Date(invoice.paidAt.replace(' ', 'T') + 'Z'))}</p>
          )}
          <h3>Datos del cliente y envío</h3>
          <p>
            {invoice.shipping.name}<br />
            {invoice.shipping.address}<br />
            {invoice.shipping.postalCode} {invoice.shipping.city}
            {invoice.shipping.phone && <><br />{invoice.shipping.phone}</>}
          </p>
          <div className="catalog-invoice-table-wrapper">
            <table className="catalog-invoice-table">
              <thead>
                <tr><th>Producto</th><th>Cantidad</th><th>Precio unitario</th><th>Importe</th></tr>
              </thead>
              <tbody>
                {invoice.items.map((item) => (
                  <tr key={item.slug}>
                    <td>{item.name}</td>
                    <td>{item.quantity}</td>
                    <td>{formatPrice(item.unitPriceCents / 100)}</td>
                    <td>{formatPrice(item.unitPriceCents * item.quantity / 100)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="catalog-invoice-total"><strong>Total pagado: {formatPrice(invoice.totalCents / 100)}</strong></p>
          <p>Este documento es una simulación y no incluye desglose fiscal.</p>
        </article>
      )}
      <div className="catalog-invoice-actions">
        {invoice && (
          <button className="catalog-primary-button" type="button" onClick={() => window.print()}>
            Imprimir o guardar como PDF
          </button>
        )}
        <button className="catalog-link-button" type="button" onClick={onBack}>Volver a mis pedidos</button>
      </div>
    </section>
  )
}

export default CatalogInvoice
