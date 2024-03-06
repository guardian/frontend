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
      CrosswordMobileBanner,
      DCRTagPages,
    )
  implicit val canCheckExperiment: CanCheckExperiment = new CanCheckExperiment(this)
}

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

object DCRTagPages
    extends Experiment(
      name = "dcr-tag-pages",
      description = "Render tag pages with DCR",
      owners = Seq(Owner.withGithub("dotcom.platform@theguardian.com")),
      sellByDate = LocalDate.of(2024, 4, 1),
      participationGroup = Perc2C,
    )
