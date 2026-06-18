import PageLegale from '../../components/PageLegale'

function MentionsLegales() {
  return (
    <PageLegale titre="Mentions légales" miseAJour="15 juin 2026">
      <h2 className="text-xl font-semibold text-primary">Éditeur</h2>
      <p>
        Le présent service est édité par <strong>Rémi Vincent — PostHack</strong> (entreprise
        individuelle), Normandie, France. Contact : <code>contact@reseauxinfluences.fr</code>.
      </p>
      <p className="text-sm text-gray-500">
        <em>À compléter avant ouverture : SIREN, adresse postale, directeur de la publication.</em>
      </p>

      <h2 className="text-xl font-semibold text-primary">Hébergement</h2>
      <p>
        Hébergeur : <strong>Infomaniak Network SA</strong>, Rue Eugène-Marziano 25, 1227 Les
        Acacias, Genève, Suisse. Données hébergées en Suisse / Union européenne (adéquation
        reconnue). Aucun transfert hors UE/EEE n'est opéré par le service.
      </p>

      <h2 className="text-xl font-semibold text-primary">Objet du service</h2>
      <p>
        Réseaux d'Influence est un projet de <strong>journalisme de données</strong> visant à
        cartographier, à partir de <strong>sources publiques officielles</strong> et de médias
        vérifiables, les relations d'influence entre personnalités publiques, organisations et sites
        web. Le service exclut toute surveillance d'individus privés et toute donnée issue de
        réseaux sociaux ou de fuites non journalistiques.
      </p>

      <h2 className="text-xl font-semibold text-primary">Propriété intellectuelle</h2>
      <p>
        La licence du corpus de données sera précisée à l'ouverture (cf. ADR-007 à paraître). Les
        données proviennent de sources publiques dont les conditions de réutilisation respectives
        s'appliquent (Licence Ouverte Etalab, CC-BY, etc.).
      </p>

      <h2 className="text-xl font-semibold text-primary">Données personnelles</h2>
      <p>
        Le traitement de données personnelles est décrit dans la{' '}
        <a className="underline text-primary" href="/politique-confidentialite">
          politique de confidentialité
        </a>
        . Vous pouvez exercer vos droits via la page{' '}
        <a className="underline text-primary" href="/mes-droits">
          Exercer mes droits
        </a>
        .
      </p>
    </PageLegale>
  )
}

export default MentionsLegales
