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
      DCRJavascriptBundle,
      StackedCarousels,
    )
  implicit val canCheckExperiment: CanCheckExperiment = new CanCheckExperiment(this)
}

object DarkModeWeb
    extends Experiment(
      name = "dark-mode-web",
      description = "Enable dark mode on web",
      owners = Seq(Owner.withGithub("jakeii"), Owner.withEmail("dotcom.platform@theguardian.com")),
      sellByDate = LocalDate.of(2025, 7, 30),
      participationGroup = Perc0D,
    )

object DCRJavascriptBundle
    extends Experiment(
      name = "dcr-javascript-bundle",
      description = "DCAR JS bundle experiment to test replacing Preact with React",
      owners = Seq(Owner.withEmail("dotcom.platform@theguardian.com")),
      sellByDate = LocalDate.of(2025, 6, 30),
      participationGroup = Perc0E,
    )

object StackedCarousels
    extends Experiment(
      name = "stacked-carousels",
      description = "Show stacked cards instead of carousels on UK front on mobile",
      owners = Seq(Owner.withEmail("fronts.and.curation@guardian.co.uk")),
      sellByDate = LocalDate.of(2025, 7, 30),
      participationGroup = Perc5A,
    )
