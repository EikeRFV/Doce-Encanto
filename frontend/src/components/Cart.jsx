import { useCart } from '../hooks/useCart'
import { formatPrice } from '../utils/helpers'
import { Link } from 'react-router-dom'

function Cart() {
  const { cartItems, removeFromCart, updateQuantity, total, clearCart } =
    useCart()

  if (cartItems.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🛒</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Seu carrinho está vazio
        </h2>
        <p className="text-gray-600 mb-8">
          Adicione alguns produtos deliciosos para começar!
        </p>
        <Link
          to="/produtos"
          className="inline-block bg-primary text-white px-8 py-3 rounded-lg font-bold hover:bg-opacity-90 transition"
        >
          Explorar Produtos
        </Link>
      </div>
    )
  }

  return (
    <div>
      <div className="space-y-4">
        {cartItems.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-lg p-4 flex gap-4 items-center justify-between"
          >
            <div className="flex-1">
              <h3 className="font-bold text-lg">{item.name}</h3>
              <p className="text-gray-600">{formatPrice(item.price)}</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  updateQuantity(item.id, item.quantity - 1)
                }
                className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
              >
                −
              </button>
              <span className="w-8 text-center font-bold">
                {item.quantity}
              </span>
              <button
                onClick={() =>
                  updateQuantity(item.id, item.quantity + 1)
                }
                className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
              >
                +
              </button>
            </div>

            <div className="text-right">
              <p className="font-bold">
                {formatPrice(item.price * item.quantity)}
              </p>
            </div>

            <button
              onClick={() => removeFromCart(item.id)}
              className="text-red-500 hover:text-red-700 font-bold"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-gray-100 rounded-lg p-6">
        <div className="flex justify-between items-center mb-4 text-lg font-bold">
          <span>Total:</span>
          <span className="text-primary text-2xl">{formatPrice(total)}</span>
        </div>
        <Link
          to="/checkout"
          className="w-full inline-block text-center bg-primary text-white py-3 rounded-lg font-bold hover:bg-opacity-90 transition mb-2"
        >
          Finalizar Compra
        </Link>
        <button
          onClick={clearCart}
          className="w-full bg-gray-300 text-gray-800 py-3 rounded-lg font-bold hover:bg-gray-400 transition"
        >
          Limpar Carrinho
        </button>
      </div>
    </div>
  )
}

export default Cart
