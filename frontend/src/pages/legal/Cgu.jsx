import PageLegale from '../../components/PageLegale'

function Cgu() {
  return (
    <PageLegale titre="Conditions générales d'utilisation" miseAJour="15 juin 2026">
      <h2 className="text-xl font-semibold text-primary">1. Objet</h2>
      <p>
        Les présentes CGU régissent l'usage du service Réseaux d'Influence, plateforme collaborative
        de cartographie des réseaux d'influence à finalité de journalisme de données.
      </p>

      <h2 className="text-xl font-semibold text-primary">2. Périmètre autorisé</h2>
      <p>
        Le service vise <strong>exclusivement</strong> les personnes exerçant une influence publique
        (élus, dirigeants, lobbyistes, responsables d'organisations…) et les organisations.
      </p>
      <p className="border-l-4 border-red-500 bg-red-50 text-red-900 px-4 py-3 rounded">
        <strong>Interdiction stricte :</strong> il est interdit de renseigner, d'enrichir ou de
        cibler des <strong>citoyens privés</strong> n'exerçant aucune influence publique. Toute
        contribution portant sur un particulier sera rejetée et pourra entraîner la suspension du
        compte.
      </p>

      <h2 className="text-xl font-semibold text-primary">3. Sources admissibles</h2>
      <p>
        Seules sont admises les <strong>sources publiques officielles</strong> (registres,
        open data) et les <strong>médias vérifiables</strong>. Sont exclus : réseaux sociaux,
        données issues de fuites non journalistiques, collecte par contournement technique, données
        nominatives à accès restreint.
      </p>

      <h2 className="text-xl font-semibold text-primary">4. Contributions et validation</h2>
      <p>
        Les contributions sont soumises à un processus de validation communautaire (consensus requis
        avant publication). Aucune donnée n'est publiée automatiquement. Le contributeur garantit
        l'exactitude et le sourçage de ses apports.
      </p>

      <h2 className="text-xl font-semibold text-primary">5. Modération</h2>
      <p>
        L'éditeur peut retirer toute donnée inexacte, diffamatoire ou hors périmètre, et traiter les
        signalements et demandes de droits dans les délais légaux.
      </p>

      <h2 className="text-xl font-semibold text-primary">6. Responsabilité</h2>
      <p>
        Le service est fourni en l'état, à finalité d'information du public. L'éditeur ne saurait
        être tenu responsable d'un usage des données contraire aux présentes CGU ou à la loi.
      </p>
    </PageLegale>
  )
}

export default Cgu
