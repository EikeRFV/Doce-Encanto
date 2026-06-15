import { useState, useEffect } from 'react'
import { userService } from '../services/userService'
import { formatPrice } from '../utils/helpers'

function ProfilePage() {
  const [user, setUser] = useState(null)
  const [wallet, setWallet] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('profile')
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({})

  useEffect(() => {
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    try {
      setLoading(true)
      const userResponse = await userService.getProfile()
      setUser(userResponse.data)
      setFormData(userResponse.data)

      const walletResponse = await userService.getWallet()
      setWallet(walletResponse.data)

      setError(null)
    } catch (err) {
      console.error('Erro ao buscar dados:', err)
      setError('Erro ao carregar dados do usuário')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSaveProfile = async () => {
    try {
      await userService.updateProfile(formData)
      setUser(formData)
      setEditing(false)
    } catch (err) {
      setError('Erro ao atualizar perfil')
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">⏳</div>
        <p className="text-gray-600 text-lg">Carregando perfil...</p>
      </div>
    )
  }

  if (error && !user) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">❌</div>
        <p className="text-red-600 text-lg">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-bold">Meu Perfil</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Abas */}
      <div className="flex gap-4 border-b">
        {[
          { id: 'profile', label: 'Perfil' },
          { id: 'wallet', label: '💰 Carteira' },
          { id: 'wishlist', label: '❤️ Lista de Desejos' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-3 font-semibold transition ${
              activeTab === tab.id
                ? 'text-primary border-b-2 border-primary'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Conteúdo das Abas */}
      {activeTab === 'profile' && user && (
        <div className="bg-white rounded-lg shadow p-6 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Informações Pessoais</h2>
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="bg-primary text-white px-6 py-2 rounded-lg font-semibold"
              >
                Editar
              </button>
            )}
          </div>

          {editing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Nome:
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Email:
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Telefone:
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleSaveProfile}
                  className="bg-green-500 text-white px-6 py-2 rounded-lg font-semibold"
                >
                  Salvar
                </button>
                <button
                  onClick={() => {
                    setEditing(false)
                    setFormData(user)
                  }}
                  className="bg-gray-300 text-gray-800 px-6 py-2 rounded-lg font-semibold"
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-gray-600 text-sm">Nome</p>
                <p className="text-lg font-semibold">{user.name}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Email</p>
                <p className="text-lg font-semibold">{user.email}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">CPF</p>
                <p className="text-lg font-semibold">{user.cpf}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Telefone</p>
                <p className="text-lg font-semibold">{user.phone}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'wallet' && wallet && (
        <div className="bg-white rounded-lg shadow p-6 space-y-6">
          <h2 className="text-2xl font-bold">Minha Carteira</h2>

          <div className="bg-gradient-to-r from-primary to-secondary rounded-lg p-8 text-white">
            <p className="text-gray-100 mb-2">Saldo Disponível</p>
            <p className="text-4xl font-bold">{formatPrice(wallet.balance)}</p>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-4">Adicionar Créditos</h3>
            <div className="space-y-3">
              {[50, 100, 200, 500].map((amount) => (
                <button
                  key={amount}
                  className="w-full border-2 border-primary text-primary px-4 py-3 rounded-lg font-semibold hover:bg-primary hover:text-white transition"
                >
                  + {formatPrice(amount)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-4">Transações Recentes</h3>
            <p className="text-gray-600 text-center py-8">
              Nenhuma transação realizada
            </p>
          </div>
        </div>
      )}

      {activeTab === 'wishlist' && (
        <div className="bg-white rounded-lg shadow p-6 space-y-6">
          <h2 className="text-2xl font-bold">Lista de Desejos</h2>
          <p className="text-gray-600 text-center py-8">
            Nenhum produto na sua lista de desejos
          </p>
        </div>
      )}
    </div>
  )
}

export default ProfilePage
