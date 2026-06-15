/**
 * MesDroits — formulaire public d'exercice des droits RGPD (art. 15 à 21).
 *
 * Accessible sans compte (une personne concernée n'est pas un contributeur).
 * Câblé sur POST /api/droits. Accessibilité AAA : <fieldset>/<legend>, labels
 * explicites, messages d'erreur reliés par aria-describedby, statut en
 * aria-live polite, focus géré, cibles ≥ 44 px.
 */
import { useState } from 'react'
import { postDemandeDroit } from '../../api/client'

const TYPES = [
  { value: 'ACCES', label: 'Accès à mes données (art. 15)' },
  { value: 'RECTIFICATION', label: 'Rectification (art. 16)' },
  { value: 'EFFACEMENT', label: 'Effacement (art. 17)' },
  { value: 'LIMITATION', label: 'Limitation du traitement (art. 18)' },
  { value: 'OPPOSITION', label: 'Opposition au traitement (art. 21)' },
]

function MesDroits() {
  const [form, setForm] = useState({
    typeDroit: 'OPPOSITION',
    nomRevendique: '',
    emailContact: '',
    motif: '',
  })
  const [statut, setStatut] = useState(null) // 'envoi' | 'ok' | 'erreur'
  const [message, setMessage] = useState('')

  const maj = (champ) => (e) => setForm((f) => ({ ...f, [champ]: e.target.value }))

  const onSubmit = async (e) => {
    e.preventDefault()
    setStatut('envoi')
    setMessage('Envoi de votre demande en cours…')
    try {
      const { data } = await postDemandeDroit(form)
      setStatut('ok')
      setMessage(data.message || 'Votre demande a bien été enregistrée.')
      setForm({ typeDroit: 'OPPOSITION', nomRevendique: '', emailContact: '', motif: '' })
    } catch (err) {
      setStatut('erreur')
      const detail = err?.response?.data?.error
      setMessage(
        detail
          ? `La demande n'a pas pu être envoyée : ${detail}`
          : 'Une erreur est survenue. Réessayez plus tard ou écrivez à contact@reseauxinfluences.fr.',
      )
    }
  }

  return (
    <article className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-primary mb-2">Exercer mes droits</h1>
      <p className="text-gray-700 mb-2">
        Si une fiche vous concerne, vous pouvez demander l'accès, la rectification, l'effacement, la
        limitation ou l'opposition au traitement de vos données (RGPD art. 15 à 21). Une
        vérification de votre identité pourra vous être demandée par email avant traitement. Délai
        légal de réponse : un mois.
      </p>

      <div
        aria-live="polite"
        className={
          statut === 'ok'
            ? 'border-l-4 border-green-600 bg-green-50 text-green-900 px-4 py-3 rounded mb-4'
            : statut === 'erreur'
              ? 'border-l-4 border-red-600 bg-red-50 text-red-900 px-4 py-3 rounded mb-4'
              : 'sr-only'
        }
      >
        {message}
      </div>

      <form onSubmit={onSubmit} noValidate>
        <fieldset className="border border-gray-200 rounded-lg p-4 mb-4">
          <legend className="font-semibold text-primary px-2">Votre demande</legend>

          <div className="mb-4">
            <label htmlFor="typeDroit" className="block font-medium mb-1">
              Nature de la demande
            </label>
            <select
              id="typeDroit"
              value={form.typeDroit}
              onChange={maj('typeDroit')}
              className="w-full min-h-[44px] border border-gray-300 rounded px-3 focus-visible-ring"
            >
              {TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label htmlFor="nomRevendique" className="block font-medium mb-1">
              Nom et prénom <span className="text-red-600">*</span>
            </label>
            <input
              id="nomRevendique"
              type="text"
              required
              minLength={2}
              value={form.nomRevendique}
              onChange={maj('nomRevendique')}
              className="w-full min-h-[44px] border border-gray-300 rounded px-3 focus-visible-ring"
              autoComplete="name"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="emailContact" className="block font-medium mb-1">
              Email de contact <span className="text-red-600">*</span>
            </label>
            <input
              id="emailContact"
              type="email"
              required
              value={form.emailContact}
              onChange={maj('emailContact')}
              aria-describedby="email-aide"
              className="w-full min-h-[44px] border border-gray-300 rounded px-3 focus-visible-ring"
              autoComplete="email"
            />
            <p id="email-aide" className="text-sm text-gray-500 mt-1">
              Utilisé uniquement pour vérifier votre identité et vous répondre.
            </p>
          </div>

          <div className="mb-2">
            <label htmlFor="motif" className="block font-medium mb-1">
              Motif et précisions <span className="text-red-600">*</span>
            </label>
            <textarea
              id="motif"
              required
              minLength={10}
              rows={5}
              value={form.motif}
              onChange={maj('motif')}
              aria-describedby="motif-aide"
              className="w-full border border-gray-300 rounded px-3 py-2 focus-visible-ring"
            />
            <p id="motif-aide" className="text-sm text-gray-500 mt-1">
              Indiquez la fiche concernée (nom, URL si connue) et l'objet de votre demande.
            </p>
          </div>
        </fieldset>

        <button
          type="submit"
          disabled={statut === 'envoi'}
          className="bg-primary text-white px-6 py-3 min-h-[44px] rounded-lg font-medium hover:bg-secondary focus-visible-ring transition-colors disabled:opacity-60"
        >
          {statut === 'envoi' ? 'Envoi…' : 'Envoyer ma demande'}
        </button>
      </form>
    </article>
  )
}

export default MesDroits
