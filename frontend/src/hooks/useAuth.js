import { useState } from 'react'
import { authService } from '../services/authService'

export function useAuth() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const register = async (data) => {
    try {
      setLoading(true)
      const response = await authService.register(data)
      authService.setToken(response.data.token)
      localStorage.setItem('user', JSON.stringify(response.data.user))
      setError(null)
      return response.data
    } catch (err) {
      const message = err.response?.data?.message || err.message
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const login = async (data) => {
    try {
      setLoading(true)
      const response = await authService.login(data)
      authService.setToken(response.data.token)
      localStorage.setItem('user', JSON.stringify(response.data.user))
      setError(null)
      return response.data
    } catch (err) {
      const message = err.response?.data?.message || err.message
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    authService.logout()
    setError(null)
  }

  return {
    register,
    login,
    logout,
    loading,
    error,
    isAuthenticated: authService.isAuthenticated(),
    currentUser: authService.getCurrentUser(),
  }
}
