const euroFormatter = new Intl.NumberFormat('es-ES', {
  style: 'currency',
  currency: 'EUR',
})

export function formatPrice(price) {
  return euroFormatter.format(price)
}
