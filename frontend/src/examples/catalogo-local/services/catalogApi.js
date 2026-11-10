import { apiBaseUrl } from '../../../services/api'
import { request } from '../../../services/authApi'

async function getCatalogData(path) {
  const response = await fetch(`${apiBaseUrl}${path}`)

  if (!response.ok) {
    throw new Error('No se ha podido cargar el catálogo.')
  }

  const payload = await response.json()

  return payload.data
}

export function getCatalogProducts() {
  return getCatalogData('/catalog/products')
}

export function getCatalogCategories() {
  return getCatalogData('/catalog/categories')
}

export function createCheckout(items, shipping) {
  return request('/catalog/checkout', {
    method: 'POST',
    body: JSON.stringify({ items, shipping }),
  })
}

export function confirmOrder(orderId) {
  return request(`/catalog/orders/${orderId}/confirm`, { method: 'POST' })
}

export function getOrders() {
  return request('/catalog/orders')
}

export function getInvoice(orderId) {
  return request(`/catalog/orders/${encodeURIComponent(orderId)}/invoice`)
}
