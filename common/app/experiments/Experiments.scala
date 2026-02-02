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
      TagPageStorylines,
    )
  implicit val canCheckExperiment: CanCheckExperiment = new CanCheckExperiment(this)
}

object DarkModeWeb
    extends Experiment(
      name = "dark-mode-web",
      description = "Enable dark mode on web",
      owners = Seq(Owner.withEmail("dotcom.platform@theguardian.com")),
      sellByDate = LocalDate.of(2027, 1, 26),
      participationGroup = Perc0D,
    )

object TagPageStorylines
    extends Experiment(
      name = "tag-page-storylines",
      description = "Enable AI storylines content on web tag pages",
      owners = Seq(Owner.withEmail("ai.dev@theguardian.com")),
      sellByDate = LocalDate.of(2026, 2, 27),
      participationGroup = Perc0E,
    )
