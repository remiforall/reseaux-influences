/**
 * PageLegale — gabarit commun aux pages légales (mentions, confidentialité,
 * CGU, cookies, accessibilité).
 *
 * Accessibilité AAA : largeur de lecture limitée, hiérarchie de titres claire
 * (H1 unique fourni par `titre`), prose contrastée. Le bandeau « PROJET »
 * signale que le contenu est en attente de validation juridique (ADR-011).
 */
function PageLegale({ titre, miseAJour, projet = true, children }) {
  return (
    <article className="max-w-3xl mx-auto prose-legale">
      <h1 className="text-3xl font-bold text-primary mb-2">{titre}</h1>
      {miseAJour && (
        <p className="text-sm text-gray-500 mb-4">Dernière mise à jour : {miseAJour}</p>
      )}

      {projet && (
        <div
          role="note"
          className="border-l-4 border-amber-500 bg-amber-50 text-amber-900 px-4 py-3 mb-6 rounded"
        >
          <strong>⚠️ Document en projet.</strong> Cette page est un brouillon en attente de
          validation par un·e juriste spécialisé·e (données personnelles et droit des médias). Le
          projet est en <strong>alpha fermée</strong> : aucune ouverture publique n'a lieu avant cet
          audit (ADR-010).
        </div>
      )}

      <div className="space-y-4 text-gray-800 leading-relaxed">{children}</div>
    </article>
  )
}

export default PageLegale
