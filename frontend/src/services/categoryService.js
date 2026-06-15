import api from './api'

export const categoryService = {
  // Listar todas as categorias
  listAll: (query) => api.get('/categories', { params: query }),

  // Obter categoria específica
  getById: (id) => api.get(`/categories/${id}`),

  // Listar produtos de uma categoria
  getProducts: (categoryId, query) =>
    api.get(`/categories/${categoryId}/products`, { params: query }),

  // Criar categoria (Admin)
  create: (data) => api.post('/categories', data),

  // Atualizar categoria (Admin)
  update: (id, data) => api.patch(`/categories/${id}`, data),

  // Deletar categoria (Admin)
  delete: (id) => api.delete(`/categories/${id}`),
}
