import api from './api'

export const productService = {
  // Listar todos os produtos
  listAll: (query) => api.get('/products', { params: query }),

  // Obter um produto específico
  getById: (id) => api.get(`/products/${id}`),

  // Criar produto (Admin/Manager)
  create: (data) => api.post('/products', data),

  // Atualizar produto (Admin/Manager)
  update: (id, data) => api.patch(`/products/${id}`, data),

  // Deletar produto (Admin)
  delete: (id) => api.delete(`/products/${id}`),

  // Listar categorias
  getCategories: () => api.get('/categories'),
}
