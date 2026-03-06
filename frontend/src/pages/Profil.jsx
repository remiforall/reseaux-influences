import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { getUtilisateur } from '../api/client'
import BadgeDisplay from '../components/BadgeDisplay'

function Profil() {
  const { id } = useParams()
  const [utilisateur, setUtilisateur] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUtilisateur = async () => {
      try {
        const { data } = await getUtilisateur(id)
        setUtilisateur(data)
      } catch (err) {
        console.error('Erreur chargement du profil:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchUtilisateur()
  }, [id])

  if (loading) {
    return <p className="text-center text-gray-500 py-8">Chargement du profil...</p>
  }

  if (!utilisateur) {
    return <p className="text-center text-red-600 py-8">Profil introuvable.</p>
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow p-8">
        <div className="flex items-center space-x-4 mb-6">
          {utilisateur.avatar_url ? (
            <img
              src={utilisateur.avatar_url}
              alt={utilisateur.pseudo}
              className="w-16 h-16 rounded-full"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center text-2xl font-bold">
              {(utilisateur.pseudo || '?')[0].toUpperCase()}
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold text-primary">{utilisateur.pseudo}</h1>
            <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
              utilisateur.niveau === 'moderateur' ? 'bg-purple-100 text-purple-800'
              : utilisateur.niveau === 'expert' ? 'bg-blue-100 text-blue-800'
              : utilisateur.niveau === 'intermediaire' ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-800'
            }`}>
              {utilisateur.niveau}
            </span>
          </div>
        </div>

        {utilisateur.bio && (
          <p className="text-gray-600 mb-6">{utilisateur.bio}</p>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-3 bg-gray-50 rounded">
            <p className="text-2xl font-bold text-primary">{utilisateur.points}</p>
            <p className="text-sm text-gray-500">Points</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded">
            <p className="text-2xl font-bold text-primary">{utilisateur.validations_effectuees}</p>
            <p className="text-sm text-gray-500">Validations</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded">
            <p className="text-2xl font-bold text-primary">{utilisateur.soumissions_acceptees}</p>
            <p className="text-sm text-gray-500">Liens acceptés</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded">
            <p className="text-2xl font-bold text-primary">{utilisateur.taux_precision}%</p>
            <p className="text-sm text-gray-500">Précision</p>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-bold text-primary mb-3">Badges</h2>
          <BadgeDisplay badges={utilisateur.badges_obtenus} />
        </div>
      </div>
    </div>
  )
}

export default Profil
