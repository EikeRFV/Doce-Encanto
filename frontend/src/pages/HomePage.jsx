import { Link } from 'react-router-dom'

function HomePage() {
  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-secondary rounded-lg p-12 text-white text-center">
        <h1 className="text-5xl font-bold mb-4">Bem-vindo ao Doce Encanto</h1>
        <p className="text-xl mb-8">Descubra os melhores doces e confeitaria artesanal</p>
        <Link
          to="/produtos"
          className="inline-block bg-white text-primary px-8 py-3 rounded-lg font-bold hover:bg-gray-100 transition"
        >
          Explorar Produtos
        </Link>
      </section>

      {/* Featured Products */}
      <section>
        <h2 className="text-3xl font-bold mb-8">Produtos em Destaque</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((item) => (
            <Link
              key={item}
              to={`/produtos/${item}`}
              className="bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden group"
            >
              <div className="bg-gray-300 h-48 flex items-center justify-center group-hover:bg-gray-400 transition">
                <span className="text-gray-600">Imagem Produto {item}</span>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition">
                  Produto {item}
                </h3>
                <p className="text-gray-600 text-sm mb-4">Descrição do produto</p>
                <div className="flex justify-between items-center">
                  <span className="text-primary font-bold">R$ 29,90</span>
                  <button className="bg-primary text-white px-4 py-2 rounded hover:bg-opacity-90 transition">
                    Ver
                  </button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section>
        <h2 className="text-3xl font-bold mb-8">Categorias</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {['Bolos', 'Brigadeiros', 'Cookies'].map((category) => (
            <Link
              key={category}
              to="/produtos"
              className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg p-8 text-center cursor-pointer hover:shadow-lg transition"
            >
              <div className="text-4xl mb-4">🎂</div>
              <h3 className="font-bold text-xl hover:text-primary transition">{category}</h3>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}

export default HomePage
