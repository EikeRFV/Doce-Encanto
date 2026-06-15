import { useState, useEffect } from 'react'
import { categoryService } from '../services/categoryService'

export function useCategories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true)
        const response = await categoryService.listAll()
        setCategories(response.data.data || response.data)
        setError(null)
      } catch (err) {
        console.error('Erro ao buscar categorias:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  return { categories, loading, error }
}
