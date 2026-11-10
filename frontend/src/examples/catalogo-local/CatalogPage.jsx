import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import CatalogAuthForm from './components/CatalogAuthForm'
import CatalogFilters from './components/CatalogFilters'
import CatalogProductCard from './components/CatalogProductCard'
import CheckoutForm from './components/CheckoutForm'
import CatalogInvoice from './components/CatalogInvoice'
import OrderHistory from './components/OrderHistory'
import RiojaBox from './components/RiojaBox'
import ShoppingCart from './components/ShoppingCart'
import { useCatalog } from './hooks/useCatalog'
import { confirmOrder, createCheckout, getInvoice, getOrders } from './services/catalogApi'
import './catalog.css'

const cartStorageKey = 'catalog-cart'

function loadStoredCart() {
  try {
    return JSON.parse(sessionStorage.getItem(cartStorageKey)) ?? {}
  } catch {
    return {}
  }
}

function getReturnParams() {
  return new URLSearchParams(window.location.hash.split('?')[1] ?? '')
}

function CatalogPage() {
  const { products, categories, isLoading, error } = useCatalog()
  const { user, isLoading: isAuthLoading, signIn, signUp, signOut } = useAuth()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [sortOrder, setSortOrder] = useState('featured')
  const [cart, setCart] = useState(loadStoredCart)
  const [view, setView] = useState('shop')
  const [isPaying, setIsPaying] = useState(false)
  const [checkoutError, setCheckoutError] = useState('')
  const [orders, setOrders] = useState([])
  const [ordersLoading, setOrdersLoading] = useState(false)
  const [ordersError, setOrdersError] = useState('')
  const [invoice, setInvoice] = useState(null)
  const [invoiceLoading, setInvoiceLoading] = useState(false)
  const [invoiceError, setInvoiceError] = useState('')
  const [banner, setBanner] = useState(null)

  useEffect(() => {
    sessionStorage.setItem(cartStorageKey, JSON.stringify(cart))
  }, [cart])

  useEffect(() => {
    if (isAuthLoading) {
      return
    }

    const params = getReturnParams()
    const orderId = params.get('pedido')
    const wasCancelled = params.get('cancelado')

    if (!orderId && !wasCancelled) {
      return
    }

    window.history.replaceState(null, '', '#/catalogo-local')

    if (wasCancelled) {
      setBanner({ type: 'error', text: 'Has cancelado el pago. Tu cesta sigue guardada.' })
      return
    }

    if (!user) {
      setBanner({ type: 'error', text: 'Inicia sesión para comprobar el estado de tu pedido.' })
      return
    }

    confirmOrder(orderId)
      .then(({ status }) => {
        if (status === 'paid') {
          setCart({})
          setBanner({ type: 'success', text: '¡Pago recibido! Tu pedido se ha registrado correctamente.' })
        } else {
          setBanner({ type: 'error', text: 'El pago todavía no consta como completado.' })
        }
      })
      .catch((confirmError) => setBanner({ type: 'error', text: confirmError.message }))
  }, [isAuthLoading, user])

  function openOrders() {
    setView('orders')
    setOrdersLoading(true)
    setOrdersError('')
    getOrders()
      .then(setOrders)
      .catch((ordersLoadError) => setOrdersError(ordersLoadError.message))
      .finally(() => setOrdersLoading(false))
  }

  async function openInvoice(orderId) {
    setView('invoice')
    setInvoice(null)
    setInvoiceLoading(true)
    setInvoiceError('')
    try {
      setInvoice(await getInvoice(orderId))
    } catch (loadError) {
      setInvoiceError(loadError.message)
    } finally {
      setInvoiceLoading(false)
    }
  }

  async function handleLogin(email, password) {
    await signIn(email, password)
    setView('checkout')
  }

  async function handlePay(shipping) {
    setIsPaying(true)
    setCheckoutError('')

    try {
      const items = Object.entries(cart).map(([id, quantity]) => ({ id, quantity }))
      const { checkoutUrl } = await createCheckout(items, shipping)
      window.location.assign(checkoutUrl)
    } catch (payError) {
      setCheckoutError(payError.message)
      setIsPaying(false)
    }
  }

  const visibleProducts = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase('es')
    const filteredProducts = products.filter((product) => {
      const matchesCategory = category === 'all' || product.category.slug === category
      const matchesSearch = `${product.name} ${product.description} ${product.category.name}`
        .toLocaleLowerCase('es')
        .includes(normalizedSearch)

      return matchesCategory && matchesSearch
    })

    if (sortOrder === 'price-ascending') {
      return filteredProducts.sort((first, second) => first.price - second.price)
    }

    if (sortOrder === 'price-descending') {
      return filteredProducts.sort((first, second) => second.price - first.price)
    }

    return filteredProducts
  }, [category, products, search, sortOrder])

  const cartItems = products
    .filter((product) => cart[product.id])
    .map((product) => ({ ...product, quantity: cart[product.id] }))
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0)
  const cartTotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0)

  function updateQuantity(productId, amount) {
    setCart((currentCart) => {
      const nextQuantity = (currentCart[productId] ?? 0) + amount

      if (nextQuantity <= 0) {
        const remainingItems = { ...currentCart }
        delete remainingItems[productId]
        return remainingItems
      }

      return { ...currentCart, [productId]: nextQuantity }
    })
  }

  function addBoxToCart(productIds) {
    if (productIds.some((id) => (cart[id] ?? 0) >= 10)) {
      return 'No se ha añadido la selección: la cesta admite hasta 10 unidades de cada conserva.'
    }

    if (new Set([...Object.keys(cart), ...productIds]).size > 20) {
      return 'No se ha añadido la selección: la cesta admite hasta 20 productos distintos.'
    }

    setCart((currentCart) => {
      const nextCart = { ...currentCart }
      productIds.forEach((id) => { nextCart[id] = (nextCart[id] ?? 0) + 1 })
      return nextCart
    })
    return 'Selección añadida a la cesta.'
  }

  return (
    <main className="catalog-page">
      <header className="catalog-header">
        <div className="catalog-container catalog-header-content">
          <a className="catalog-brand" href="#proyectos" aria-label="Despensa de aquí, volver al portfolio">
            <svg className="catalog-brand-mark" viewBox="0 0 48 48" fill="none" aria-hidden="true">
              <circle cx="24" cy="24" r="22.5" stroke="currentColor" />
              <path d="M24 35V19m0 8c-8 0-11-5-11-12 6 0 11 4 11 12Zm0-3c0-7 4-11 11-11 0 7-3 11-11 11ZM17 36h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="catalog-brand-wordmark">
              <span className="catalog-brand-name">despensa <em>de aquí</em></span>
              <span className="catalog-brand-caption">Conservas de La Rioja</span>
            </span>
          </a>
          <div className="catalog-header-actions">
            {user && (
              <>
                <button className="catalog-link-button" type="button" onClick={openOrders}>Mis pedidos</button>
                <button className="catalog-link-button" type="button" onClick={signOut}>Salir ({user.email})</button>
              </>
            )}
            <a className="catalog-back-link" href="#proyectos">← Volver al portfolio</a>
          </div>
        </div>
      </header>

      <div className="catalog-container">
        {banner && (
          <p className={`catalog-notice ${banner.type === 'error' ? 'catalog-notice-error' : ''}`} role="status">
            {banner.text}
          </p>
        )}

        {view === 'auth' && !user && <CatalogAuthForm onLogin={handleLogin} onRegister={signUp} />}
        {view === 'checkout' && user && cartItems.length > 0 && (
          <CheckoutForm
            user={user}
            items={cartItems}
            total={cartTotal}
            isSubmitting={isPaying}
            error={checkoutError}
            onSubmit={handlePay}
            onBack={() => setView('shop')}
          />
        )}
        {view === 'orders' && user && (
          <OrderHistory orders={orders} isLoading={ordersLoading} error={ordersError} onBack={() => setView('shop')} onInvoice={openInvoice} />
        )}
        {view === 'invoice' && user && (
          <CatalogInvoice invoice={invoice} isLoading={invoiceLoading} error={invoiceError} onBack={() => setView('orders')} />
        )}

        {(view === 'shop' || (view === 'auth' && user) || (view === 'checkout' && (!user || cartItems.length === 0))) && (
        <>
        <section className="catalog-intro" aria-labelledby="catalog-title">
          <div className="catalog-intro-copy">
            <p className="catalog-eyebrow">Una despensa de muestra · La Rioja</p>
            <h1 id="catalog-title">Conservas con <em>sabor a casa.</em></h1>
            <p>
              Explora una selección ficticia de conservas inspiradas en la despensa riojana.
              Busca, filtra y añade tus favoritas al carrito de esta demo.
            </p>
            <span className="catalog-demo-note">Proyecto ficticio: productos, marca y precios de muestra.</span>
          </div>
          <div className="catalog-intro-art" aria-hidden="true">
            <div className="catalog-intro-seal">
              <span>DE LA HUERTA</span>
              <svg viewBox="0 0 64 64" fill="none">
                <path d="M32 50V25m0 14c-11 0-16-7-16-17 9 0 16 6 16 17Zm0-4c0-11 6-17 16-17 0 10-5 17-16 17ZM22 51h20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>A TU MESA</span>
            </div>
            <span className="catalog-intro-art-caption">Sabores para compartir</span>
          </div>
        </section>

        {!isLoading && !error && products.length > 0 && (
          <RiojaBox products={products} onAddToCart={addBoxToCart} />
        )}

        <div className="catalog-layout">
          <section className="catalog-listing" aria-labelledby="catalog-products-title">
            <div className="catalog-listing-heading">
              <div>
                <p className="catalog-eyebrow">La selección</p>
                <h2 id="catalog-products-title">Conservas de temporada</h2>
              </div>
            </div>

            <div className="catalog-filters">
              <CatalogFilters
                search={search}
                onSearchChange={setSearch}
                category={category}
                categories={categories}
                onCategoryChange={setCategory}
                sortOrder={sortOrder}
                onSortOrderChange={setSortOrder}
              />
            </div>

            {isLoading && <p className="catalog-empty" role="status">Cargando conservas...</p>}
            {error && <p className="catalog-empty catalog-error" role="alert">{error}</p>}

            {!isLoading && !error && (
              <p className="catalog-result-count" aria-live="polite">
                {visibleProducts.length} {visibleProducts.length === 1 ? 'conserva' : 'conservas'}
              </p>
            )}

            {!isLoading && !error && visibleProducts.length > 0 && (
              <div className="catalog-product-grid">
                {visibleProducts.map((product) => (
                  <CatalogProductCard
                    key={product.id}
                    product={product}
                    onAdd={() => updateQuantity(product.id, 1)}
                  />
                ))}
              </div>
            )}

            {!isLoading && !error && visibleProducts.length === 0 && (
              <p className="catalog-empty" role="status">No hay conservas que coincidan. Prueba otra búsqueda o categoría.</p>
            )}
          </section>

          <ShoppingCart
            items={cartItems}
            itemCount={cartCount}
            total={cartTotal}
            onUpdateQuantity={updateQuantity}
            onClear={() => setCart({})}
            onCheckout={() => {
              setBanner(null)
              setView(user ? 'checkout' : 'auth')
            }}
          />
        </div>
        </>
        )}
      </div>
    </main>
  )
}

export default CatalogPage
