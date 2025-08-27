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
      DarkModeWeb,
      TopAboveNav250Reservation,
      SourcepointConsentGeolocation,
      GoogleOneTap,
    )
  implicit val canCheckExperiment: CanCheckExperiment = new CanCheckExperiment(this)
}

object SourcepointConsentGeolocation
    extends Experiment(
      name = "sp-consent-geolocation",
      description =
        "This test is being used to monitor discrepancies between the sourcepoint geolocation and fastly geolocation.",
      owners = Seq(Owner.withEmail("identity.dev@guardian.co.uk")),
      sellByDate = LocalDate.of(2025, 12, 1),
      participationGroup = Perc0B,
    )

object GoogleOneTap
    extends Experiment(
      name = "google-one-tap",
      description = "Signing into the Guardian with Google One Tap",
      owners = Seq(Owner.withEmail("identity.dev@theguardian.com")),
      sellByDate = LocalDate.of(2025, 12, 1),
      participationGroup = Perc0C,
    )

object DarkModeWeb
    extends Experiment(
      name = "dark-mode-web",
      description = "Enable dark mode on web",
      owners = Seq(Owner.withEmail("dotcom.platform@theguardian.com")),
      sellByDate = LocalDate.of(2025, 10, 31),
      participationGroup = Perc0D,
    )

object TopAboveNav250Reservation
    extends Experiment(
      name = "top-above-nav-250-reservation",
      description = "Reserve 250px for top-above-nav instead of 90px",
      owners = Seq(Owner.withEmail("commercial.dev@theguardian.com")),
      sellByDate = LocalDate.of(2025, 8, 29),
      participationGroup = Perc2A,
    )
