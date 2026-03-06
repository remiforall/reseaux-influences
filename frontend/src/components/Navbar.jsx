import { Link } from 'react-router-dom'

function Navbar() {
  return (
    <nav className="bg-primary text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="text-xl font-bold">
            Réseaux d'Influence
          </Link>
          <div className="flex space-x-6">
            <Link to="/" className="hover:text-accent transition-colors">
              Accueil
            </Link>
            <Link to="/liens" className="hover:text-accent transition-colors">
              Liens
            </Link>
            <Link to="/graphe" className="hover:text-accent transition-colors">
              Graphe
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
