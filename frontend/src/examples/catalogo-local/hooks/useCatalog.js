import { useEffect, useState } from 'react'
import { getCatalogCategories, getCatalogProducts } from '../services/catalogApi'

export function useCatalog() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isCurrent = true

    async function loadCatalog() {
      try {
        const [loadedProducts, loadedCategories] = await Promise.all([
          getCatalogProducts(),
          getCatalogCategories(),
        ])

        if (isCurrent) {
          setProducts(loadedProducts)
          setCategories(loadedCategories)
        }
      } catch (loadError) {
        if (isCurrent) {
          setError(loadError.message)
        }
      } finally {
        if (isCurrent) {
          setIsLoading(false)
        }
      }
    }

    loadCatalog()

    return () => {
      isCurrent = false
    }
  }, [])

  return { products, categories, isLoading, error }
}
