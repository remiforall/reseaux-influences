import { useState } from 'react'
import { postValidation } from '../api/client'

function ValidationForm({ lienId, onValidated }) {
  const [verdict, setVerdict] = useState(null)
  const [commentaire, setCommentaire] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async () => {
    if (!verdict) return
    setLoading(true)
    setError(null)
    try {
      await postValidation({ lien: lienId, verdict, commentaire })
      if (onValidated) onValidated()
    } catch (err) {
      setError(err.response?.data?.detail || 'Erreur lors de la validation.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white border rounded-lg p-4 space-y-3">
      <h4 className="font-semibold text-sm text-gray-700">Valider ce lien</h4>
      <div className="flex space-x-2">
        {['vrai', 'faux', 'indecis'].map((v) => (
          <button
            key={v}
            onClick={() => setVerdict(v)}
            className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
              verdict === v
                ? v === 'vrai' ? 'bg-green-600 text-white'
                : v === 'faux' ? 'bg-red-600 text-white'
                : 'bg-yellow-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {v === 'vrai' ? 'Vrai' : v === 'faux' ? 'Faux' : 'Indécis'}
          </button>
        ))}
      </div>
      <textarea
        value={commentaire}
        onChange={(e) => setCommentaire(e.target.value)}
        placeholder="Commentaire optionnel..."
        className="w-full border rounded p-2 text-sm"
        rows={2}
      />
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <button
        onClick={handleSubmit}
        disabled={!verdict || loading}
        className="bg-secondary text-white px-4 py-2 rounded text-sm font-medium hover:bg-primary transition-colors disabled:opacity-50"
      >
        {loading ? 'Envoi...' : 'Valider'}
      </button>
    </div>
  )
}

export default ValidationForm
