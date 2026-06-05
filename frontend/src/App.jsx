import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Accueil from './pages/Accueil'
import Liens from './pages/Liens'
import Graphe from './pages/Graphe'
import Profil from './pages/Profil'
import Enrichissement from './pages/Enrichissement'

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/*
       * Skip link WCAG AAA 2.4.1 — masqué visuellement jusqu'au focus clavier.
       * Permet de sauter la navigation et d'aller directement au contenu.
       * Doit être le premier élément focusable du document.
       */}
      <a
        href="#contenu-principal"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:bg-primary focus:text-white focus:px-4 focus:py-2 focus:rounded focus-visible-ring"
      >
        Aller au contenu principal
      </a>

      <Navbar />

      <main id="contenu-principal" className="container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<Accueil />} />
          <Route path="/liens" element={<Liens />} />
          <Route path="/graphe" element={<Graphe />} />
          <Route path="/profil/:id" element={<Profil />} />
          {/* Route enrichissement — accessible aux utilisateurs authentifiés uniquement */}
          <Route path="/enrichissement" element={<Enrichissement />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
