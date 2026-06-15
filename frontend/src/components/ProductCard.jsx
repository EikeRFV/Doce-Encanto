import { useState } from 'react'
import { Link } from 'react-router-dom'
import { formatPrice } from '../utils/helpers'

function ProductCard({ product, onAddToCart }) {
  const [isAdding, setIsAdding] = useState(false)

  const handleAddClick = (e) => {
    e.preventDefault()
    setIsAdding(true)
    onAddToCart(product)
    setTimeout(() => setIsAdding(false), 500)
  }

  return (
    <Link
      to={`/produtos/${product.id}`}
      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden group"
    >
      <div className="relative bg-gray-200 h-48 flex items-center justify-center overflow-hidden group-hover:bg-gray-300 transition">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-gray-400 text-center px-4">{product.name}</span>
        )}
        {product.discount && (
          <div className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
            -{product.discount}%
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-bold text-lg text-gray-800 mb-2 line-clamp-2 group-hover:text-primary transition">
          {product.name}
        </h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {product.description}
        </p>

        <div className="flex justify-between items-center">
          <div>
            {product.originalPrice && (
              <span className="text-gray-400 line-through text-sm mr-2">
                {formatPrice(product.originalPrice)}
              </span>
            )}
            <span className="text-primary font-bold text-lg">
              {formatPrice(product.price)}
            </span>
          </div>
        </div>

        <button
          onClick={handleAddClick}
          className={`w-full mt-4 px-4 py-2 rounded font-semibold transition ${
            isAdding
              ? 'bg-green-500 text-white'
              : 'bg-primary text-white hover:bg-opacity-90'
          }`}
        >
          {isAdding ? '✓ Adicionado' : 'Adicionar ao Carrinho'}
        </button>
      </div>
    </Link>
  )
}

export default ProductCard
