import PageLegale from '../../components/PageLegale'

function DeclarationAccessibilite() {
  return (
    <PageLegale titre="Déclaration d'accessibilité" miseAJour="15 juin 2026">
      <p>
        Réseaux d'Influence s'engage à rendre son service accessible conformément au RGAA 4.1.2
        (Référentiel Général d'Amélioration de l'Accessibilité) et vise le niveau WCAG 2.1{' '}
        <strong>AAA</strong>.
      </p>

      <h2 className="text-xl font-semibold text-primary">État de conformité</h2>
      <p>
        <strong>Conformité partielle en cours.</strong> Cible AAA. Un audit d'accessibilité externe
        est planifié avant l'ouverture publique. À ce jour, l'autoévaluation couvre : navigation
        clavier complète, ordre de tabulation logique, skip links, focus visible (≥ 3:1), contrastes
        renforcés (≥ 7:1 visés), alternatives tableau pour les visualisations graphiques, respect de{' '}
        <code>prefers-reduced-motion</code>, structure de titres hiérarchisée, libellés ARIA.
      </p>

      <h2 className="text-xl font-semibold text-primary">Technologies utilisées</h2>
      <p>HTML, CSS (Tailwind), JavaScript (React), SVG (D3), cartographie Leaflet.</p>

      <h2 className="text-xl font-semibold text-primary">Retour et contact</h2>
      <p>
        Si vous rencontrez un défaut d'accessibilité, signalez-le à{' '}
        <code>accessibilite@reseauxinfluences.fr</code>. Vous avez le droit d'obtenir une réponse et,
        à défaut, de saisir le Défenseur des droits (
        <a className="underline text-primary" href="https://www.defenseurdesdroits.fr" rel="noopener noreferrer">
          defenseurdesdroits.fr
        </a>
        ).
      </p>

      <p className="text-sm text-gray-500">
        <em>
          Déclaration à compléter selon le modèle officiel DINUM après l'audit externe (résultats de
          tests, critères non conformes, dérogations éventuelles).
        </em>
      </p>
    </PageLegale>
  )
}

export default DeclarationAccessibilite
