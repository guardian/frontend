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
      RemoveLiteFronts,
      MastheadWithHighlights,
      DarkModeWeb,
    )
  implicit val canCheckExperiment: CanCheckExperiment = new CanCheckExperiment(this)
}

object MastheadWithHighlights
    extends Experiment(
      name = "masthead-with-highlights",
      description =
        "Shows new masthead component, with highlights container, in place of current header/navigation and top bar",
      owners = Seq(Owner.withGithub("cemms1"), Owner.withEmail("project.fairground@theguardian.com")),
      sellByDate = LocalDate.of(2024, 10, 15),
      participationGroup = Perc50,
    )

object DarkModeWeb
    extends Experiment(
      name = "dark-mode-web",
      description = "Enable dark mode on web",
      owners = Seq(Owner.withGithub("jakeii"), Owner.withEmail("dotcom.platform@theguardian.com")),
      sellByDate = LocalDate.of(2024, 10, 30),
      participationGroup = Perc0D,
    )

object RemoveLiteFronts
    extends Experiment(
      name = "remove-lite-fronts",
      description = "Get the full pressed page of a front instead of the lite version",
      owners = Seq(Owner.withEmail("dotcom.platform@theguardian.com")),
      sellByDate = LocalDate.of(2024, 10, 30),
      participationGroup = Perc10A,
    )
