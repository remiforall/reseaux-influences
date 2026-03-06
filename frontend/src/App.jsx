import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Accueil from './pages/Accueil'
import Liens from './pages/Liens'
import Graphe from './pages/Graphe'
import Profil from './pages/Profil'

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<Accueil />} />
          <Route path="/liens" element={<Liens />} />
          <Route path="/graphe" element={<Graphe />} />
          <Route path="/profil/:id" element={<Profil />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
