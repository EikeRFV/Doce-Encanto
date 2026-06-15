import api from './api'

export const reviewService = {
  // Listar reviews de um produto
  getByProduct: (productId, query) =>
    api.get(`/reviews/product/${productId}`, { params: query }),

  // Criar review
  create: (data) => api.post('/reviews', data),

  // Atualizar review
  update: (id, data) => api.patch(`/reviews/${id}`, data),

  // Deletar review
  delete: (id) => api.delete(`/reviews/${id}`),
}
