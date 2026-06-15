import { useState } from 'react'
import { useCart } from '../hooks/useCart'
import { orderService } from '../services/orderService'
import { formatPrice } from '../utils/helpers'

function CheckoutPage() {
  const { cartItems, total, clearCart } = useCart()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState({
    addressId: '',
    paymentMethod: 'CREDIT_CARD',
    voucherCode: '',
    notes: '',
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (cartItems.length === 0) {
      setError('Carrinho vazio')
      return
    }

    if (!formData.addressId) {
      setError('Selecione um endereço')
      return
    }

    try {
      setLoading(true)
      setError(null)

      const orderData = {
        items: cartItems.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
        })),
        addressId: formData.addressId,
        paymentMethod: formData.paymentMethod,
        voucherCode: formData.voucherCode || undefined,
        notes: formData.notes || undefined,
      }

      await orderService.create(orderData)
      setSuccess(true)
      clearCart()
      setFormData({
        addressId: '',
        paymentMethod: 'CREDIT_CARD',
        voucherCode: '',
        notes: '',
      })

      setTimeout(() => {
        window.location.href = '/pedidos'
      }, 2000)
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao criar pedido')
    } finally {
      setLoading(false)
    }
  }

  if (cartItems.length === 0 && !success) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">🛒</div>
        <p className="text-gray-600 text-lg">Carrinho vazio</p>
      </div>
    )
  }

  if (success) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">✓</div>
        <h2 className="text-3xl font-bold text-green-600 mb-2">
          Pedido Criado com Sucesso!
        </h2>
        <p className="text-gray-600 mb-4">
          Você será redirecionado para meus pedidos...
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-bold">Checkout</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Formulário */}
        <div className="md:col-span-2 space-y-8">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Endereço */}
            <div className="bg-white rounded-lg p-6 shadow">
              <h2 className="text-2xl font-bold mb-4">Endereço de Entrega</h2>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Selecione um endereço:
                </label>
                <select
                  name="addressId"
                  value={formData.addressId}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Selecione um endereço</option>
                  <option value="1">Rua Principal, 123 - São Paulo</option>
                  <option value="2">Av. Secundária, 456 - São Paulo</option>
                </select>
              </div>
            </div>

            {/* Método de Pagamento */}
            <div className="bg-white rounded-lg p-6 shadow">
              <h2 className="text-2xl font-bold mb-4">Método de Pagamento</h2>
              <div className="space-y-3">
                {[
                  { value: 'CREDIT_CARD', label: '💳 Cartão de Crédito' },
                  { value: 'DEBIT_CARD', label: '🏦 Cartão de Débito' },
                  { value: 'PIX', label: '📱 PIX' },
                  { value: 'WALLET', label: '💰 Carteira' },
                ].map((method) => (
                  <label key={method.value} className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method.value}
                      checked={formData.paymentMethod === method.value}
                      onChange={handleChange}
                      className="w-4 h-4"
                    />
                    <span>{method.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Cupom de Desconto */}
            <div className="bg-white rounded-lg p-6 shadow">
              <h2 className="text-2xl font-bold mb-4">Cupom de Desconto</h2>
              <input
                type="text"
                name="voucherCode"
                value={formData.voucherCode}
                onChange={handleChange}
                placeholder="Digite seu código de cupom"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Observações */}
            <div className="bg-white rounded-lg p-6 shadow">
              <h2 className="text-2xl font-bold mb-4">Observações</h2>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Observações sobre o pedido (opcional)"
                rows="4"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white font-bold py-3 px-4 rounded-lg hover:bg-opacity-90 disabled:opacity-50 transition"
            >
              {loading ? 'Processando...' : 'Finalizar Pedido'}
            </button>
          </form>
        </div>

        {/* Resumo do Pedido */}
        <div className="bg-white rounded-lg p-6 shadow h-fit">
          <h2 className="text-2xl font-bold mb-4">Resumo do Pedido</h2>

          <div className="space-y-3 mb-6 pb-6 border-b">
            {cartItems.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span>
                  {item.name} x{item.quantity}
                </span>
                <span className="font-semibold">
                  {formatPrice(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          <div className="space-y-2 mb-4 pb-4 border-b">
            <div className="flex justify-between text-sm">
              <span>Subtotal:</span>
              <span>{formatPrice(total)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Frete:</span>
              <span>{formatPrice(15)}</span>
            </div>
          </div>

          <div className="flex justify-between text-xl font-bold">
            <span>Total:</span>
            <span className="text-primary">{formatPrice(total + 15)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CheckoutPage
