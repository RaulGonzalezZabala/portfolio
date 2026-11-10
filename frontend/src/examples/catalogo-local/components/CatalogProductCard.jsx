import { formatPrice } from '../utils/formatPrice'

function CatalogProductCard({ product, onAdd }) {
  return (
    <article className="catalog-product-card">
      <div className={`catalog-product-art catalog-product-art-${product.accent}`} aria-hidden="true">
        <div className="catalog-jar">
          <div className="catalog-jar-lid" />
          <div className="catalog-jar-label">{product.label}</div>
        </div>
        <span className="catalog-art-sparkle">✳</span>
      </div>
      <div className="catalog-product-info">
        <p className="catalog-product-category">{product.category.name}</p>
        <h3>{product.name}</h3>
        <p>{product.description}</p>
        <div className="catalog-product-footer">
          <strong>{formatPrice(product.price)}</strong>
          <button
            className="catalog-add-button"
            type="button"
            onClick={onAdd}
            aria-label={`Añadir ${product.name} al carrito`}
          >
            Añadir <span aria-hidden="true">+</span>
          </button>
        </div>
      </div>
    </article>
  )
}

export default CatalogProductCard
