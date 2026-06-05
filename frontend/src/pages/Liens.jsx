import { useState, useEffect } from 'react'
import { getLiens } from '../api/client'
import ValidationForm from '../components/ValidationForm'
import { urlExterneSure } from '../utils/securite'

function Liens() {
  const [liens, setLiens] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchLiens = async () => {
    setLoading(true)
    try {
      const { data } = await getLiens()
      setLiens(data.results || data)
    } catch (err) {
      console.error('Erreur chargement des liens:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLiens()
  }, [])

  if (loading) {
    return <p className="text-center text-gray-500 py-8">Chargement des liens...</p>
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-primary mb-6">Liens d'influence</h1>

      {liens.length === 0 ? (
        <p className="text-gray-500">Aucun lien pour le moment.</p>
      ) : (
        <div className="space-y-4">
          {liens.map((lien) => (
            <div key={lien.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-lg">
                  {lien.personne_a_detail?.nom_complet || 'Personne A'}
                  <span className="mx-2 text-gray-400">&rarr;</span>
                  {lien.personne_b_detail?.nom_complet || 'Personne B'}
                </h3>
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    lien.statut === 'valide'
                      ? 'bg-green-100 text-green-800'
                      : lien.statut === 'rejete'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {lien.statut}
                </span>
              </div>

              {lien.type_lien_detail && (
                <span
                  className="inline-block px-2 py-1 rounded text-xs font-medium text-white mb-2"
                  style={{ backgroundColor: lien.type_lien_detail.couleur || '#6b7280' }}
                >
                  {lien.type_lien_detail.libelle}
                </span>
              )}

              {lien.description && <p className="text-gray-600 text-sm mb-2">{lien.description}</p>}

              <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                <span>Confiance : {lien.score_confiance}%</span>
                <span>Validations : {lien.nb_validations_total}</span>
              </div>

              {lien.source_detail && urlExterneSure(lien.source_detail.url) && (
                <a
                  href={urlExterneSure(lien.source_detail.url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-secondary text-sm hover:underline"
                >
                  Source : {lien.source_detail.titre}
                </a>
              )}

              {lien.statut === 'en_attente' && (
                <div className="mt-4">
                  <ValidationForm lienId={lien.id} onValidated={fetchLiens} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Liens
