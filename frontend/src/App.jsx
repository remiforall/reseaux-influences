import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Accueil from './pages/Accueil'
import Liens from './pages/Liens'
import Graphe from './pages/Graphe'
import Profil from './pages/Profil'
import Enrichissement from './pages/Enrichissement'
import MentionsLegales from './pages/legal/MentionsLegales'
import PolitiqueConfidentialite from './pages/legal/PolitiqueConfidentialite'
import Cgu from './pages/legal/Cgu'
import Cookies from './pages/legal/Cookies'
import DeclarationAccessibilite from './pages/legal/DeclarationAccessibilite'
import MesDroits from './pages/legal/MesDroits'
import Ressources from './pages/Ressources'

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

          {/* Pages légales (PROJET — prérequis levée alpha ADR-011) */}
          <Route path="/mentions-legales" element={<MentionsLegales />} />
          <Route path="/politique-confidentialite" element={<PolitiqueConfidentialite />} />
          <Route path="/cgu" element={<Cgu />} />
          <Route path="/cookies" element={<Cookies />} />
          <Route path="/declaration-accessibilite" element={<DeclarationAccessibilite />} />
          <Route path="/mes-droits" element={<MesDroits />} />

          {/* Webographie OSINT — boîte à outils (sources non intégrées) */}
          <Route path="/ressources" element={<Ressources />} />
        </Routes>
      </main>

      <Footer />
    </div>
  )
}

export default App
