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
      AdaptiveSite,
      DeeplyRead,
      CrosswordMobileBanner,
      OphanNext,
      DCRTagPages,
    )
  implicit val canCheckExperiment: CanCheckExperiment = new CanCheckExperiment(this)
}

object DeeplyRead
    extends Experiment(
      name = "deeply-read",
      description = "When ON, deeply read footer section is displayed",
      owners = Seq(Owner.withEmail("dotcom.platform@theguardian.com")),
      sellByDate = LocalDate.of(2024, 2, 27),
      participationGroup = Perc50,
    )

object AdaptiveSite
    extends Experiment(
      name = "adaptive-site",
      description = "Enables serving an adaptive version of the site that responds to page performance",
      owners = Seq(Owner.withEmail("dotcom.platform@theguardian.com")),
      sellByDate = LocalDate.of(2024, 4, 2),
      participationGroup = Perc1A,
    )

object CrosswordMobileBanner
    extends Experiment(
      name = "crossword-mobile-banner",
      description = "Test banner advert in mobile crossword page",
      owners = Seq(Owner.withEmail("commercial.dev@theguardian.com")),
      sellByDate = LocalDate.of(2024, 4, 2),
      participationGroup = Perc2A,
    )

object OphanNext
    extends Experiment(
      name = "ophan-next",
      description = "Use @guardian/ophan-tracker-js@2.1.0-next.1, which allows tracking of clicks on external links",
      owners = Seq(Owner.withGithub("@guardian/ophan")),
      sellByDate = LocalDate.of(2024, 4, 1),
      participationGroup = Perc20A,
    )

object DCRTagPages
    extends Experiment(
      name = "dcr-tag-pages",
      description = "Render tag pages with DCR",
      owners = Seq(Owner.withGithub("dotcom.platform@theguardian.com")),
      sellByDate = LocalDate.of(2024, 4, 1),
      participationGroup = Perc2C,
    )
