/**
 * Connexion — page d'authentification.
 *
 * Formulaire email / mot de passe → POST /api/auth/connexion → stocke le token
 * JWT dans localStorage (clé `token`, lue par l'intercepteur axios de client.js
 * et par la Navbar). Redirige ensuite vers /graphe.
 *
 * Rappel métier : en alpha fermée (ADR-010), tout le corpus est en statut
 * EN_ATTENTE et n'est visible que des utilisateurs authentifiés. Sans connexion,
 * le graphe apparaît vide (filtre VALIDE-only forcé côté serveur pour les anonymes).
 *
 * Accessibilité AAA :
 *   - <label> explicite + autocomplete sur chaque champ
 *   - message d'erreur en role="alert" (aria-live assertive)
 *   - cibles ≥ 44 px, focus-visible-ring, contrastes ≥ 7:1
 *   - focus porté sur le champ email au montage
 */
import { useState, useEffect, useRef } from 'react'
import { connexion } from '../api/client'

function Connexion() {
  const [email, setEmail] = useState('')
  const [motDePasse, setMotDePasse] = useState('')
  const [erreur, setErreur] = useState('')
  const [chargement, setChargement] = useState(false)
  const champEmailRef = useRef(null)

  useEffect(() => {
    champEmailRef.current?.focus()
  }, [])

  const soumettre = async (e) => {
    e.preventDefault()
    setErreur('')
    setChargement(true)
    try {
      const { data } = await connexion({ email, motDePasse })
      if (!data?.token) {
        throw new Error('Réponse inattendue du serveur (token manquant).')
      }
      localStorage.setItem('token', data.token)
      /* Rechargement complet : la Navbar lit le token de façon synchrone au
       * montage, un rechargement garantit l'état authentifié partout. */
      window.location.href = '/graphe'
    } catch (err) {
      const message =
        err?.response?.status === 401
          ? 'Identifiants invalides. Vérifiez l’adresse e-mail et le mot de passe.'
          : err?.response?.data?.error ||
            err?.message ||
            'Échec de la connexion. Réessayez.'
      setErreur(message)
      setChargement(false)
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-bold text-primary mb-2">Connexion</h1>
      <p className="text-gray-700 mb-6">
        Le projet est en <strong>alpha fermée</strong> : les données importées sont
        en attente de modération et ne sont visibles qu’une fois connecté·e.
      </p>

      <form onSubmit={soumettre} noValidate>
        {erreur && (
          <p
            role="alert"
            aria-live="assertive"
            className="mb-4 rounded border border-red-700 bg-red-50 px-3 py-2 text-red-800"
          >
            <span aria-hidden="true">⚠️ </span>
            {erreur}
          </p>
        )}

        <div className="mb-4">
          <label htmlFor="email" className="block font-medium mb-1">
            Adresse e-mail
          </label>
          <input
            id="email"
            ref={champEmailRef}
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full min-h-[44px] border border-gray-300 rounded px-3 focus-visible-ring"
          />
        </div>

        <div className="mb-6">
          <label htmlFor="motDePasse" className="block font-medium mb-1">
            Mot de passe
          </label>
          <input
            id="motDePasse"
            type="password"
            autoComplete="current-password"
            required
            value={motDePasse}
            onChange={(e) => setMotDePasse(e.target.value)}
            className="w-full min-h-[44px] border border-gray-300 rounded px-3 focus-visible-ring"
          />
        </div>

        <button
          type="submit"
          disabled={chargement}
          className="w-full min-h-[44px] bg-primary text-white font-medium rounded px-4 hover:bg-primary/90 focus-visible-ring transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {chargement ? 'Connexion…' : 'Se connecter'}
        </button>
      </form>
    </div>
  )
}

export default Connexion
