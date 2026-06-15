import { Link } from 'react-router-dom'
import CartBadge from './CartBadge'

function Header() {
  return (
    <header className="bg-white shadow sticky top-0 z-50">
      <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-primary hover:opacity-80 transition">
          🍰 Doce Encanto
        </Link>
        
        <div className="flex gap-6 items-center">
          <Link to="/" className="text-gray-600 hover:text-primary transition font-semibold">
            Início
          </Link>
          <Link to="/produtos" className="text-gray-600 hover:text-primary transition font-semibold">
            Produtos
          </Link>
          <Link to="/pedidos" className="text-gray-600 hover:text-primary transition font-semibold">
            Pedidos
          </Link>
          <Link to="/carrinho" className="text-gray-600 hover:text-primary transition font-semibold flex items-center">
            🛒 Carrinho
            <CartBadge />
          </Link>
          <Link to="/perfil" className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-opacity-90 transition font-semibold">
            👤 Perfil
          </Link>
        </div>
      </nav>
    </header>
  )
}

export default Header
