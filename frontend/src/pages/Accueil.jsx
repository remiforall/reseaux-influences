function Accueil() {
  return (
    <div className="max-w-4xl mx-auto">
      <section className="text-center py-12">
        <h1 className="text-4xl font-bold text-primary mb-4">
          Réseaux d'Influence
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Cartographiez les liens d'influence entre personnes publiques,
          vérifiés par des sources médiatiques et validés par la communauté.
        </p>
        <div className="flex justify-center space-x-4">
          <a
            href="/graphe"
            className="bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-secondary transition-colors"
          >
            Explorer le graphe
          </a>
          <a
            href="/liens"
            className="bg-accent text-white px-6 py-3 rounded-lg font-medium hover:bg-orange-600 transition-colors"
          >
            Voir les liens
          </a>
        </div>
      </section>

      <section className="grid md:grid-cols-3 gap-6 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-bold text-lg mb-2 text-primary">Contribuez</h3>
          <p className="text-gray-600">
            Proposez des liens entre personnes publiques, sourcés par des
            articles de presse, documents officiels ou vidéos vérifiables.
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-bold text-lg mb-2 text-primary">Validez</h3>
          <p className="text-gray-600">
            Vérifiez les liens proposés par la communauté. Validez au moins 5
            liens pour pouvoir soumettre les vôtres et gagnez des badges.
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-bold text-lg mb-2 text-primary">Explorez</h3>
          <p className="text-gray-600">
            Naviguez dans le graphe interactif des réseaux d'influence.
            Filtrez par type de relation, pays ou score de confiance.
          </p>
        </div>
      </section>

      <section className="bg-white rounded-lg shadow p-6 my-8">
        <h2 className="text-2xl font-bold text-primary mb-4">
          Comment ça marche ?
        </h2>
        <ol className="space-y-3 text-gray-700">
          <li className="flex items-start">
            <span className="bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center mr-3 flex-shrink-0 font-bold">1</span>
            <span><strong>Inscrivez-vous</strong> avec votre email pour créer votre profil de contributeur.</span>
          </li>
          <li className="flex items-start">
            <span className="bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center mr-3 flex-shrink-0 font-bold">2</span>
            <span><strong>Validez 5 liens</strong> existants en indiquant s'ils sont vrais, faux ou indécis.</span>
          </li>
          <li className="flex items-start">
            <span className="bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center mr-3 flex-shrink-0 font-bold">3</span>
            <span><strong>Soumettez un lien</strong> entre deux personnes publiques avec une source vérifiable.</span>
          </li>
          <li className="flex items-start">
            <span className="bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center mr-3 flex-shrink-0 font-bold">4</span>
            <span><strong>Gagnez des badges</strong> et progressez en niveau grâce à vos contributions.</span>
          </li>
        </ol>
      </section>
    </div>
  )
}

export default Accueil
