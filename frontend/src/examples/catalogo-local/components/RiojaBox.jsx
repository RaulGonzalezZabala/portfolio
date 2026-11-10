import { useState } from 'react'
import { formatPrice } from '../utils/formatPrice'

const occasions = [
  {
    id: 'aperitivo',
    name: 'Para el aperitivo',
    description: 'Un pequeño encuentro alrededor de la mesa.',
    products: ['piquillos-asados', 'esparragos-blancos', 'alcachofas'],
  },
  {
    id: 'familia',
    name: 'Para compartir',
    description: 'Sabores de cuchara para reunir a los tuyos.',
    products: ['menestra', 'pochas', 'melocoton'],
  },
  {
    id: 'regalo',
    name: 'Para regalar',
    description: 'Una selección variada para sorprender.',
    products: ['piquillos-asados', 'pochas', 'melocoton'],
  },
]

function RiojaBox({ products, onAddToCart }) {
  const [occasion, setOccasion] = useState(occasions[0])
  const [selectedIds, setSelectedIds] = useState(occasions[0].products)
  const [message, setMessage] = useState('')
  const selectedProducts = products.filter((product) => selectedIds.includes(product.id))
  const unavailableCount = selectedIds.length - selectedProducts.length
  const totalCents = selectedProducts.reduce((total, product) => total + Math.round(product.price * 100), 0)

  function chooseOccasion(nextOccasion) {
    setOccasion(nextOccasion)
    setSelectedIds(nextOccasion.products)
    setMessage('')
  }

  function toggleProduct(productId) {
    setSelectedIds((current) => current.includes(productId)
      ? current.filter((id) => id !== productId)
      : [...current, productId])
    setMessage('')
  }

  function addBox() {
    setMessage(onAddToCart(selectedProducts.map((product) => product.id)))
  }

  return (
    <section className="rioja-box" aria-labelledby="rioja-box-title">
      <div className="rioja-box-heading">
        <p className="catalog-eyebrow">Una caja, muchas historias</p>
        <h2 id="rioja-box-title">Prepara tu caja riojana</h2>
        <p>Elige una ocasión y crea tu propia selección de conservas ficticias.</p>
      </div>

      <div className="rioja-box-occasions" role="group" aria-label="Elige una ocasión">
        {occasions.map((option) => (
          <button
            className="rioja-box-occasion"
            type="button"
            key={option.id}
            aria-pressed={occasion.id === option.id}
            onClick={() => chooseOccasion(option)}
          >
            <strong>{option.name}</strong>
            <span>{option.description}</span>
          </button>
        ))}
      </div>

      <div className="rioja-box-content">
        <div>
          <h3>Hazla a tu gusto</h3>
          <p>Marca o desmarca las conservas. Añadiremos una unidad de cada una a tu cesta.</p>
          {unavailableCount > 0 && <p role="status">Algunas conservas de esta propuesta no están disponibles; puedes elegir otras.</p>}
          <div className="rioja-box-products">
            {products.map((product) => (
              <label className="rioja-box-product" key={product.id}>
                <input type="checkbox" checked={selectedIds.includes(product.id)} onChange={() => toggleProduct(product.id)} />
                <span>{product.name}</span>
                <strong>{formatPrice(product.price)}</strong>
              </label>
            ))}
          </div>
        </div>

        <div className="rioja-box-preview">
          <p className="rioja-box-preview-label">Tu selección · {selectedProducts.length} {selectedProducts.length === 1 ? 'conserva' : 'conservas'}</p>
          <div className="rioja-box-illustration" aria-hidden="true">
            {selectedProducts.map((product) => (
              <div className={`rioja-box-jar rioja-box-jar-${product.accent}`} key={product.id}>
                <span>{product.label}</span>
              </div>
            ))}
          </div>
          <p className="rioja-box-total"><span>Total de la selección</span><strong>{formatPrice(totalCents / 100)}</strong></p>
          <button className="catalog-primary-button" type="button" disabled={selectedProducts.length === 0} onClick={addBox}>
            Añadir selección a la cesta
          </button>
          <p className="rioja-box-hint">Se añaden como productos individuales; puedes cambiarlos en la cesta.</p>
          {message && <p className="rioja-box-message" role="status">{message}</p>}
        </div>
      </div>
    </section>
  )
}

export default RiojaBox
