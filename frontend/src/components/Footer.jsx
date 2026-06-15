function Footer() {
  return (
    <footer className="bg-gray-800 text-white mt-12">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-3 gap-8">
          <div>
            <h3 className="font-bold text-lg mb-4">Sobre</h3>
            <p className="text-gray-400 text-sm">
              Doce Encanto - Seus doces favoritos entregues com carinho.
            </p>
          </div>
          <div>
            <h3 className="font-bold text-lg mb-4">Links</h3>
            <ul className="text-gray-400 text-sm space-y-2">
              <li><a href="#" className="hover:text-white transition">Contato</a></li>
              <li><a href="#" className="hover:text-white transition">FAQ</a></li>
              <li><a href="#" className="hover:text-white transition">Política de Privacidade</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-lg mb-4">Suporte</h3>
            <ul className="text-gray-400 text-sm space-y-2">
              <li>Email: contato@doceencanto.com</li>
              <li>Telefone: (11) 9999-9999</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400 text-sm">
          <p>&copy; 2026 Doce Encanto. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
