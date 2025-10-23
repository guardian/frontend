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
      GoogleOneTap,
      LabsRedesign,
    )
  implicit val canCheckExperiment: CanCheckExperiment = new CanCheckExperiment(this)
}

object GoogleOneTap
    extends Experiment(
      name = "google-one-tap",
      description = "Signing into the Guardian with Google One Tap",
      owners = Seq(Owner.withEmail("identity.dev@theguardian.com")),
      sellByDate = LocalDate.of(2025, 12, 1),
      participationGroup = Perc0B,
    )

object LabsRedesign
    extends Experiment(
      name = "labs-redesign",
      description = "Allows opting in to preview the Guardian Labs redesign work",
      owners = Seq(Owner.withEmail("commercial.dev@theguardian.com")),
      sellByDate = LocalDate.of(2025, 12, 16),
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
