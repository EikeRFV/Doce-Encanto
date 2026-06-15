import { useState, useEffect } from 'react'
import { orderService } from '../services/orderService'
import { formatPrice } from '../utils/helpers'

function MyOrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('todos')

  useEffect(() => {
    fetchOrders()
  }, [filter])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const response = await orderService.getMyOrders({
        status: filter !== 'todos' ? filter : undefined,
      })
      setOrders(response.data.data || response.data)
      setError(null)
    } catch (err) {
      console.error('Erro ao buscar pedidos:', err)
      setError('Erro ao carregar pedidos')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      CONFIRMED: 'bg-blue-100 text-blue-800',
      PROCESSING: 'bg-purple-100 text-purple-800',
      SHIPPED: 'bg-cyan-100 text-cyan-800',
      DELIVERED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const getStatusLabel = (status) => {
    const labels = {
      PENDING: 'Pendente',
      CONFIRMED: 'Confirmado',
      PROCESSING: 'Processando',
      SHIPPED: 'Enviado',
      DELIVERED: 'Entregue',
      CANCELLED: 'Cancelado',
    }
    return labels[status] || status
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">⏳</div>
        <p className="text-gray-600 text-lg">Carregando pedidos...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">❌</div>
        <p className="text-red-600 text-lg">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-bold">Meus Pedidos</h1>

      {/* Filtros */}
      <div className="flex gap-4 flex-wrap">
        {[
          { value: 'todos', label: 'Todos' },
          { value: 'PENDING', label: 'Pendentes' },
          { value: 'CONFIRMED', label: 'Confirmados' },
          { value: 'DELIVERED', label: 'Entregues' },
          { value: 'CANCELLED', label: 'Cancelados' },
        ].map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-6 py-2 rounded-lg font-semibold transition ${
              filter === f.value
                ? 'bg-primary text-white'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Lista de Pedidos */}
      {orders.length > 0 ? (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold">
                    Pedido #{order.orderNumber}
                  </h3>
                  <p className="text-gray-600">
                    {new Date(order.createdAt).toLocaleDateString('pt-BR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                <div className={`px-4 py-2 rounded-full font-semibold ${getStatusColor(order.status)}`}>
                  {getStatusLabel(order.status)}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 py-4 border-t border-b">
                <div>
                  <p className="text-gray-600 text-sm">Subtotal</p>
                  <p className="font-bold">{formatPrice(order.subtotal)}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Desconto</p>
                  <p className="font-bold text-green-600">
                    -{formatPrice(order.discount || 0)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Frete</p>
                  <p className="font-bold">{formatPrice(order.shippingCost)}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Total</p>
                  <p className="font-bold text-xl text-primary">
                    {formatPrice(order.total)}
                  </p>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-gray-600 text-sm mb-2">Itens do Pedido:</p>
                <div className="space-y-2">
                  {order.items?.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span>{item.productName} x{item.quantity}</span>
                      <span>{formatPrice(item.subtotal)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button className="flex-1 bg-primary text-white py-2 rounded-lg font-semibold hover:bg-opacity-90 transition">
                  Ver Detalhes
                </button>
                {order.status === 'DELIVERED' && (
                  <button className="flex-1 border-2 border-primary text-primary py-2 rounded-lg font-semibold hover:bg-primary hover:text-white transition">
                    Avaliar Produtos
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg">
          <div className="text-4xl mb-4">📦</div>
          <p className="text-gray-600 text-lg">Nenhum pedido encontrado</p>
        </div>
      )}
    </div>
  )
}

export default MyOrdersPage
