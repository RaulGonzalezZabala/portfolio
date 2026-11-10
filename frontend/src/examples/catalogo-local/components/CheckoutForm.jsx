import { useState } from 'react'
import { formatPrice } from '../utils/formatPrice'

const emptyShipping = { name: '', phone: '', address: '', city: '', postalCode: '' }

function CheckoutForm({ user, items, total, isSubmitting, error, onSubmit, onBack }) {
  const [shipping, setShipping] = useState(emptyShipping)

  function updateField(field) {
    return (event) => setShipping((current) => ({ ...current, [field]: event.target.value }))
  }

  function handleSubmit(event) {
    event.preventDefault()
    onSubmit(shipping)
  }

  return (
    <section className="catalog-panel" aria-labelledby="catalog-checkout-title">
      <p className="catalog-eyebrow">Tramitar pedido</p>
      <h2 id="catalog-checkout-title">Datos de envío</h2>
      <p className="catalog-panel-intro">
        Pedido a nombre de {user.email}. El pago se realiza en Stripe en modo de pruebas.
      </p>

      <div className="catalog-checkout-layout">
        <form className="catalog-form" onSubmit={handleSubmit}>
          <label>
            <span>Nombre y apellidos</span>
            <input type="text" autoComplete="name" value={shipping.name} onChange={updateField('name')} minLength="2" maxLength="160" required />
          </label>
          <label>
            <span>Teléfono (opcional)</span>
            <input type="tel" autoComplete="tel" value={shipping.phone} onChange={updateField('phone')} maxLength="30" />
          </label>
          <label>
            <span>Dirección</span>
            <input type="text" autoComplete="street-address" value={shipping.address} onChange={updateField('address')} minLength="5" maxLength="255" required />
          </label>
          <div className="catalog-form-row">
            <label>
              <span>Localidad</span>
              <input type="text" autoComplete="address-level2" value={shipping.city} onChange={updateField('city')} minLength="2" maxLength="120" required />
            </label>
            <label>
              <span>Código postal</span>
              <input type="text" autoComplete="postal-code" value={shipping.postalCode} onChange={updateField('postalCode')} minLength="3" maxLength="12" required />
            </label>
          </div>
          {error && <p className="catalog-notice catalog-notice-error" role="alert">{error}</p>}
          <div className="catalog-form-actions">
            <button className="catalog-primary-button" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Redirigiendo a Stripe...' : `Pagar ${formatPrice(total)}`}
            </button>
            <button className="catalog-link-button" type="button" onClick={onBack} disabled={isSubmitting}>
              Volver a la tienda
            </button>
          </div>
        </form>

        <aside className="catalog-summary" aria-label="Resumen del pedido">
          <h3>Resumen</h3>
          <ul>
            {items.map((item) => (
              <li key={item.id}>
                <span>{item.quantity} × {item.name}</span>
                <strong>{formatPrice(item.price * item.quantity)}</strong>
              </li>
            ))}
          </ul>
          <div className="catalog-cart-total">
            <span>Total</span>
            <strong>{formatPrice(total)}</strong>
          </div>
          <p className="catalog-cart-disclaimer">
            Tarjeta de prueba de Stripe: 4242 4242 4242 4242, cualquier fecha futura y cualquier CVC.
          </p>
        </aside>
      </div>
    </section>
  )
}

export default CheckoutForm
