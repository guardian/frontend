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
    )
  implicit val canCheckExperiment: CanCheckExperiment = new CanCheckExperiment(this)
}

object GoogleOneTap
    extends Experiment(
      name = "google-one-tap",
      description = "Signing into the Guardian with Google One Tap",
      owners = Seq(Owner.withEmail("identity.dev@theguardian.com")),
      sellByDate = LocalDate.of(2026, 2, 2),
      participationGroup = Perc0B,
    )

object DarkModeWeb
    extends Experiment(
      name = "dark-mode-web",
      description = "Enable dark mode on web",
      owners = Seq(Owner.withEmail("dotcom.platform@theguardian.com")),
      sellByDate = LocalDate.of(2026, 1, 30),
      participationGroup = Perc0D,
    )
