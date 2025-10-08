package experiments

import conf.switches.Owner
import experiments.ParticipationGroups._

import java.time.LocalDate

/*
 * This list of active experiments is sorted by participation group.
 */
object ActiveExperiments extends ExperimentsDefinition {
  override val allExperiments: Set[Experiment] =
    Set(
      AllBoosts,
      DarkModeWeb,
      SourcepointConsentGeolocation,
      GoogleOneTap,
      ConsentOrPayEuropeInternalTest,
      LabsRedesign,
    )
  implicit val canCheckExperiment: CanCheckExperiment = new CanCheckExperiment(this)
}

object ConsentOrPayEuropeInternalTest
    extends Experiment(
      name = "consent-or-pay-europe-internal-test",
      description = "Releasing Consent or Pay to Europe for internal testing",
      owners = Seq(Owner.withEmail("identity.dev@guardian.co.uk")),
      sellByDate = LocalDate.of(2026, 4, 1),
      participationGroup = Perc0A,
    )

object SourcepointConsentGeolocation
    extends Experiment(
      name = "sp-consent-geolocation",
      description =
        "This test is being used to monitor discrepancies between the sourcepoint geolocation and fastly geolocation.",
      owners = Seq(Owner.withEmail("identity.dev@guardian.co.uk")),
      sellByDate = LocalDate.of(2025, 12, 1),
      participationGroup = Perc0B,
    )

object DarkModeWeb
    extends Experiment(
      name = "dark-mode-web",
      description = "Enable dark mode on web",
      owners = Seq(Owner.withEmail("dotcom.platform@theguardian.com")),
      sellByDate = LocalDate.of(2025, 10, 31),
      participationGroup = Perc0D,
    )

object AllBoosts
    extends Experiment(
      name = "all-boosts",
      description = "All non-feature cards on network fronts are boosted",
      owners = Seq(Owner.withEmail("fronts.and.curation@guardian.co.uk")),
      sellByDate = LocalDate.of(2025, 12, 1),
      participationGroup = Perc5A,
    )

object GoogleOneTap
    extends Experiment(
      name = "google-one-tap",
      description = "Signing into the Guardian with Google One Tap",
      owners = Seq(Owner.withEmail("identity.dev@theguardian.com")),
      sellByDate = LocalDate.of(2025, 12, 1),
      participationGroup = Perc10A,
    )

object LabsRedesign
    extends Experiment(
      name = "labs-redesign",
      description = "Allows opting in to preview the Guardian Labs redesign work",
      owners = Seq(Owner.withEmail("commercial.dev@theguardian.com")),
      sellByDate = LocalDate.of(2025, 12, 1),
      participationGroup = Perc0C,
    )
