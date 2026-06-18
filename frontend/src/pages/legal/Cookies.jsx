import PageLegale from '../../components/PageLegale'

function Cookies() {
  return (
    <PageLegale titre="Gestion des cookies" miseAJour="15 juin 2026">
      <h2 className="text-xl font-semibold text-primary">Aucun traceur</h2>
      <p>
        Réseaux d'Influence n'utilise <strong>aucun cookie de suivi</strong>, aucun traceur
        publicitaire, aucun outil de mesure d'audience tiers (pas de Google Analytics ni
        équivalent). Aucun consentement n'est donc requis à ce titre.
      </p>

      <h2 className="text-xl font-semibold text-primary">Stockage strictement nécessaire</h2>
      <p>
        Le service utilise uniquement un stockage local technique (<code>localStorage</code>) pour
        conserver votre jeton d'authentification lorsque vous êtes connecté·e en tant que
        contributeur. Ce stockage est <strong>exempté de consentement</strong> (strictement
        nécessaire au service, art. 82 loi Informatique et Libertés). Il est supprimé à la
        déconnexion.
      </p>

      <h2 className="text-xl font-semibold text-primary">Aucune donnée transmise à des tiers</h2>
      <p>
        Aucune information n'est partagée avec des régies publicitaires ou des plateformes tierces.
      </p>
    </PageLegale>
  )
}

export default Cookies
