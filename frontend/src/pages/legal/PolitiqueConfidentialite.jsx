import PageLegale from '../../components/PageLegale'

function PolitiqueConfidentialite() {
  return (
    <PageLegale titre="Politique de confidentialité" miseAJour="15 juin 2026">
      <h2 className="text-xl font-semibold text-primary">Responsable de traitement</h2>
      <p>
        Rémi Vincent — PostHack (cf. mentions légales). La qualification exacte du responsable
        (éditeur seul ou responsabilité conjointe avec les contributeurs, art. 26 RGPD) est en cours
        de cadrage juridique.
      </p>

      <h2 className="text-xl font-semibold text-primary">Finalité et base légale</h2>
      <p>
        Le service poursuit une finalité d'<strong>information du public</strong> sur les réseaux
        d'influence (redevabilité démocratique). La base légale retenue (exception journalistique,
        art. 85 RGPD / art. 80 loi Informatique et Libertés, ou intérêt légitime, art. 6.1.f) est{' '}
        <strong>en cours de validation</strong> par un·e juriste. Elle sera précisée ici avant toute
        ouverture publique.
      </p>

      <h2 className="text-xl font-semibold text-primary">Données traitées</h2>
      <ul className="list-disc pl-6">
        <li>
          <strong>Personnalités publiques</strong> : identité publique, fonctions, mandats,
          participations, liens d'influence datés — issus de sources publiques officielles.
        </li>
        <li>
          <strong>Contributeurs</strong> : adresse email, pseudonyme, activité de contribution, IP
          tronquée (dernier octet retiré).
        </li>
        <li>
          <strong>Demandes de droits</strong> : nom revendiqué, email de contact, motif, IP
          tronquée.
        </li>
      </ul>
      <p>
        Le service applique une <strong>minimisation</strong> stricte : provenance tracée par champ,
        aucune pièce d'identité conservée, aucun cookie de suivi, aucun traceur tiers.
      </p>

      <h2 className="text-xl font-semibold text-primary">Personnes concernées et garde-fous</h2>
      <p>
        Seules les personnes exerçant une <strong>influence publique</strong> (élus, dirigeants,
        lobbyistes…) entrent dans le périmètre. Tout import exige une qualification d'influence
        publique (refus automatique sinon). Le traitement des tiers non publics apparaissant par
        ricochet (proches, famille) est suspendu à l'avis juridique.
      </p>

      <h2 className="text-xl font-semibold text-primary">Durées de conservation</h2>
      <p>
        Les durées par catégorie de donnée sont détaillées dans la politique de conservation interne
        (en projet). Les liens d'influence historiques relèvent potentiellement de l'archive
        d'intérêt public.
      </p>

      <h2 className="text-xl font-semibold text-primary">Destinataires et hébergement</h2>
      <p>
        Données hébergées chez Infomaniak (Suisse/UE). Aucun transfert hors UE/EEE. Aucune cession à
        des tiers commerciaux.
      </p>

      <h2 className="text-xl font-semibold text-primary">Vos droits</h2>
      <p>
        Vous disposez des droits d'accès, de rectification, d'effacement, de limitation et
        d'opposition (art. 15 à 21 RGPD). Exercez-les via la page{' '}
        <a className="underline text-primary" href="/mes-droits">
          Exercer mes droits
        </a>
        . Vous pouvez aussi saisir la CNIL (
        <a className="underline text-primary" href="https://www.cnil.fr" rel="noopener noreferrer">
          cnil.fr
        </a>
        ).
      </p>
    </PageLegale>
  )
}

export default PolitiqueConfidentialite
