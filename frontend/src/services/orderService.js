import api from './api'

export const orderService = {
  // Criar pedido
  create: (data) => api.post('/orders', data),

  // Listar meus pedidos
  getMyOrders: (query) => api.get('/orders', { params: query }),

  // Listar todos os pedidos (Admin/Manager)
  getAllOrders: (query) => api.get('/orders/all', { params: query }),

  // Obter pedido específico
  getById: (id) => api.get(`/orders/${id}`),

  // Atualizar status do pedido
  updateStatus: (id, status) => api.patch(`/orders/${id}/status`, { status }),

  // Cancelar pedido
  cancel: (id) => api.patch(`/orders/${id}/cancel`, {}),
}
