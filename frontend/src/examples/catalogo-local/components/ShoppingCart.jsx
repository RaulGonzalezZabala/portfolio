import { formatPrice } from '../utils/formatPrice'

function ShoppingCart({ items, itemCount, total, onUpdateQuantity, onClear, onCheckout }) {
  return (
    <aside className="catalog-cart" aria-labelledby="catalog-cart-title">
      <div className="catalog-cart-heading">
        <div>
          <p className="catalog-eyebrow">Tu selección</p>
          <h2 id="catalog-cart-title">La cesta</h2>
        </div>
        <span className="catalog-cart-count" aria-label={`${itemCount} productos`}>{itemCount}</span>
      </div>

      {items.length > 0 ? (
        <>
          <ul className="catalog-cart-items">
            {items.map((item) => (
              <li className="catalog-cart-item" key={item.id}>
                <div>
                  <h3>{item.name}</h3>
                  <p>{formatPrice(item.price)} · {item.quantity} ud.</p>
                  <div className="catalog-quantity-controls" aria-label={`Cantidad de ${item.name}`}>
                    <button
                      type="button"
                      onClick={() => onUpdateQuantity(item.id, -1)}
                      aria-label={`Quitar una unidad de ${item.name}`}
                    >−</button>
                    <span>{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => onUpdateQuantity(item.id, 1)}
                      aria-label={`Añadir una unidad de ${item.name}`}
                    >+</button>
                  </div>
                </div>
                <strong>{formatPrice(item.price * item.quantity)}</strong>
              </li>
            ))}
          </ul>
          <div className="catalog-cart-total">
            <span>Total de muestra</span>
            <strong>{formatPrice(total)}</strong>
          </div>
          <button className="catalog-primary-button" type="button" onClick={onCheckout}>
            Tramitar pedido
          </button>
          <button className="catalog-clear-button" type="button" onClick={onClear}>
            Vaciar cesta
          </button>
        </>
      ) : (
        <p className="catalog-cart-empty">Tu cesta está vacía. Añade alguna conserva para empezar.</p>
      )}

      <p className="catalog-cart-disclaimer">Demo: pagos en modo de pruebas de Stripe, sin cargos reales.</p>
    </aside>
  )
}

export default ShoppingCart
