import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useProductById } from '../hooks/useProducts'
import { useCart } from '../hooks/useCart'
import { reviewService } from '../services/reviewService'
import { formatPrice } from '../utils/helpers'

function ProductDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addToCart } = useCart()
  const { product, loading, error } = useProductById(id)
  const [reviews, setReviews] = useState([])
  const [quantity, setQuantity] = useState(1)
  const [isAdding, setIsAdding] = useState(false)

  useEffect(() => {
    if (id) {
      fetchReviews()
    }
  }, [id])

  const fetchReviews = async () => {
    try {
      const response = await reviewService.getByProduct(id)
      setReviews(response.data.data || response.data)
    } catch (err) {
      console.error('Erro ao buscar reviews:', err)
    }
  }

  const handleAddToCart = async () => {
    setIsAdding(true)
    for (let i = 0; i < quantity; i++) {
      addToCart(product)
    }
    setTimeout(() => {
      setIsAdding(false)
      setQuantity(1)
    }, 500)
  }

  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : 0

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">⏳</div>
        <p className="text-gray-600 text-lg">Carregando produto...</p>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">❌</div>
        <p className="text-red-600 text-lg">Produto não encontrado</p>
        <button
          onClick={() => navigate('/produtos')}
          className="mt-4 bg-primary text-white px-6 py-2 rounded-lg"
        >
          Voltar para Produtos
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Produto */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Imagem */}
        <div className="bg-gray-200 rounded-lg h-96 flex items-center justify-center">
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover rounded-lg"
            />
          ) : (
            <span className="text-gray-400 text-center px-4">{product.name}</span>
          )}
        </div>

        {/* Detalhes */}
        <div className="space-y-6">
          <div>
            <h1 className="text-4xl font-bold mb-2">{product.name}</h1>
            <p className="text-gray-600 text-lg mb-4">{product.description}</p>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-4">
              <span className="text-yellow-400">★</span>
              <span className="font-bold">{averageRating}</span>
              <span className="text-gray-600">({reviews.length} avaliações)</span>
            </div>
          </div>

          {/* Preço */}
          <div className="bg-gray-100 p-6 rounded-lg">
            <div className="flex items-center gap-4 mb-4">
              {product.originalPrice && (
                <span className="text-gray-400 line-through text-lg">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
              <span className="text-4xl font-bold text-primary">
                {formatPrice(product.price)}
              </span>
            </div>

            {product.stockQuantity > 0 ? (
              <p className="text-green-600 font-semibold">
                Em estoque ({product.stockQuantity} disponíveis)
              </p>
            ) : (
              <p className="text-red-600 font-semibold">Fora de estoque</p>
            )}
          </div>

          {/* Quantidade */}
          <div className="space-y-2">
            <label className="block font-semibold">Quantidade:</label>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                −
              </button>
              <input
                type="number"
                value={quantity}
                onChange={(e) =>
                  setQuantity(Math.max(1, parseInt(e.target.value) || 1))
                }
                className="w-16 text-center border border-gray-300 rounded py-2"
                min="1"
                max={product.stockQuantity}
              />
              <button
                onClick={() =>
                  setQuantity(Math.min(product.stockQuantity, quantity + 1))
                }
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                +
              </button>
            </div>
          </div>

          {/* Botões */}
          <div className="space-y-3">
            <button
              onClick={handleAddToCart}
              disabled={isAdding || product.stockQuantity === 0}
              className={`w-full py-3 rounded-lg font-bold transition ${
                isAdding
                  ? 'bg-green-500 text-white'
                  : product.stockQuantity === 0
                  ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                  : 'bg-primary text-white hover:bg-opacity-90'
              }`}
            >
              {isAdding ? '✓ Adicionado ao Carrinho' : 'Adicionar ao Carrinho'}
            </button>
            <button className="w-full py-3 rounded-lg font-bold border-2 border-primary text-primary hover:bg-primary hover:text-white transition">
              ❤️ Adicionar à Lista de Desejos
            </button>
          </div>
        </div>
      </div>

      {/* Reviews */}
      <div className="space-y-6">
        <h2 className="text-3xl font-bold">Avaliações ({reviews.length})</h2>

        {reviews.length > 0 ? (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="bg-white rounded-lg p-6 shadow">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-bold">{review.user?.name || 'Anônimo'}</h4>
                    <div className="flex gap-1 text-yellow-400">
                      {'★'.repeat(review.rating)}
                      {'☆'.repeat(5 - review.rating)}
                    </div>
                  </div>
                  <span className="text-gray-500 text-sm">
                    {new Date(review.createdAt).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                <p className="text-gray-700">{review.comment}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600 text-center py-8">
            Nenhuma avaliação ainda. Seja o primeiro a avaliar!
          </p>
        )}
      </div>
    </div>
  )
}

export default ProductDetailPage
