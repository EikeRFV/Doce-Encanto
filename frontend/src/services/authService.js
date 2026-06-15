import api from './api'

export const authService = {
  // Registro
  register: (data) => api.post('/auth/register', data),

  // Login
  login: (data) => api.post('/auth/login', data),

  // Logout (local)
  logout: () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('user')
  },

  // Obter usuário atual
  getCurrentUser: () => {
    const user = localStorage.getItem('user')
    return user ? JSON.parse(user) : null
  },

  // Armazenar token
  setToken: (token) => {
    localStorage.setItem('authToken', token)
  },

  // Obter token
  getToken: () => localStorage.getItem('authToken'),

  // Verificar se está autenticado
  isAuthenticated: () => !!localStorage.getItem('authToken'),
}
