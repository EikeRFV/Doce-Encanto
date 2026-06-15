import { useState } from 'react'
import { useCart } from '../hooks/useCart'
import { useProducts } from '../hooks/useProducts'
import { useCategories } from '../hooks/useCategories'
import ProductCard from '../components/ProductCard'

function ProductsPage() {
  const { addToCart } = useCart()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('todos')

  // Buscar produtos da API
  const { products, loading, error } = useProducts({
    category: selectedCategory !== 'todos' ? selectedCategory : undefined,
    search: searchTerm || undefined,
  })

  // Buscar categorias da API
  const { categories: apiCategories } = useCategories()

  const defaultCategories = [
    { id: 'todos', name: 'Todos' },
  ]

  const allCategories = [
    ...defaultCategories,
    ...(apiCategories?.map((cat) => ({ id: cat.id, name: cat.name })) || []),
  ]

  return (
    <div className="space-y-8">
      {/* Search Section */}
      <div className="bg-white rounded-lg p-6 shadow">
        <input
          type="text"
          placeholder="Buscar produtos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Categories */}
      <div className="flex gap-4 flex-wrap">
        {allCategories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`px-6 py-2 rounded-lg font-semibold transition ${
              selectedCategory === category.id
                ? 'bg-primary text-white'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-gray-600 text-lg">Carregando produtos...</p>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">⚠️</div>
          <p className="text-red-600 text-lg">Erro ao carregar produtos</p>
          <p className="text-gray-600">{error}</p>
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={addToCart}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">🔍</div>
          <p className="text-gray-600 text-lg">Nenhum produto encontrado</p>
        </div>
      )}
    </div>
  )
}

export default ProductsPage
