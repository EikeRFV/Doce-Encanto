import { useState, useEffect } from 'react'
import { productService } from '../services/productService'

export function useProducts(query = {}) {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        const response = await productService.listAll(query)
        setProducts(response.data.data || response.data)
        setError(null)
      } catch (err) {
        console.error('Erro ao buscar produtos:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [JSON.stringify(query)])

  return { products, loading, error }
}

export function useProductById(id) {
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!id) return

    const fetchProduct = async () => {
      try {
        setLoading(true)
        const response = await productService.getById(id)
        setProduct(response.data)
        setError(null)
      } catch (err) {
        console.error('Erro ao buscar produto:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [id])

  return { product, loading, error }
}
