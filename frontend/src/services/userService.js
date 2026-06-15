import api from './api'

export const userService = {
  // Obter perfil do usuário
  getProfile: () => api.get('/users/profile'),

  // Atualizar perfil
  updateProfile: (data) => api.patch('/users/profile', data),

  // Alternar wishlist
  toggleWishlist: (productId) => api.post(`/wishlists/toggle`, { productId }),

  // Listar wishlist
  getWishlist: (query) => api.get('/wishlists', { params: query }),

  // Obter carteira
  getWallet: () => api.get('/wallets'),

  // Adicionar saldo à carteira
  addWalletBalance: (amount) => api.post('/wallets/add', { amount }),
}
