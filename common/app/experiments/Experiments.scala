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
      ServerTracking,
      DarkModeWeb,
      HideMobileHighlights,
      DCRJavascriptBundle,
      StackedCarousels,
    )
  implicit val canCheckExperiment: CanCheckExperiment = new CanCheckExperiment(this)
}

object StackedCarousels
    extends Experiment(
      name = "stacked-carousels",
      description = "Show stacked cards instead of medium carousels on UK front",
      owners = Seq(Owner.withEmail("fronts.and.curation@guardian.co.uk")),
      sellByDate = LocalDate.of(2025, 7, 30),
      participationGroup = Perc0A,
    )

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

object ServerTracking
    extends Experiment(
      name = "server-tracking",
      description = "Test server test tracking",
      owners = Seq(Owner.withEmail("fronts.and.curation@guardian.co.uk")),
      sellByDate = LocalDate.of(2025, 6, 6),
      participationGroup = Perc1A,
    )

object HideMobileHighlights
    extends Experiment(
      name = "hide-mobile-highlights",
      description = "Hide the highlights container on mobile web breakpoints.",
      owners = Seq(Owner.withEmail("fronts.and.curation@guardian.co.uk")),
      sellByDate = LocalDate.of(2025, 6, 10),
      participationGroup = Perc5A,
    )
