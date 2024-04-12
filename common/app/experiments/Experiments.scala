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
      AMPGlobalAddressList,
      AdaptiveSite,
      CommercialMegaTest,
      DCRTagPages,
      UpdatedHeaderDesign,
      MastheadWithHighlights,
      HomepageRedesign,
    )
  implicit val canCheckExperiment: CanCheckExperiment = new CanCheckExperiment(this)
}

object CommercialMegaTest
    extends Experiment(
      name = "commercial-mega-test",
      description = "Test the revenue effect of changes made during Q4",
      owners = Seq(Owner.withEmail("commercial.dev@theguardian.com")),
      sellByDate = LocalDate.of(2024, 8, 8),
      participationGroup = Perc5A,
    )

object AdaptiveSite
    extends Experiment(
      name = "adaptive-site",
      description = "Enables serving an adaptive version of the site that responds to page performance",
      owners = Seq(Owner.withEmail("dotcom.platform@theguardian.com")),
      sellByDate = LocalDate.of(2024, 5, 2),
      participationGroup = Perc1A,
    )

object DCRTagPages
    extends Experiment(
      name = "dcr-tag-pages",
      description = "Render tag pages with DCR",
      owners = Seq(Owner.withGithub("dotcom.platform@theguardian.com")),
      sellByDate = LocalDate.of(2024, 4, 15),
      participationGroup = Perc10A,
    )

object AMPGlobalAddressList
    extends Experiment(
      name = "amp-global-address-list",
      description = "Test a change to the global address list on AMP",
      owners = Seq(Owner.withEmail("commercial.dev@theguardian.com")),
      sellByDate = LocalDate.of(2024, 4, 30),
      participationGroup = Perc0A,
    )

object UpdatedHeaderDesign
    extends Experiment(
      name = "updated-header-design",
      description = "Shows updated design of Header and Nav components",
      owners = Seq(Owner.withGithub("cemms1")),
      sellByDate = LocalDate.of(2024, 9, 30),
      participationGroup = Perc0B,
    )

object MastheadWithHighlights
    extends Experiment(
      name = "masthead-with-highlights",
      description =
        "Shows new masthead component, with highlights container, in place of current header/navigation and top bar",
      owners = Seq(Owner.withGithub("cemms1")),
      sellByDate = LocalDate.of(2024, 9, 30),
      participationGroup = Perc0C,
    )

// This will remain in zero percent since it is acting as a way for internal users to preview the new designs in a live environment
object HomepageRedesign
    extends Experiment(
      name = "homepage-redesign",
      description =
        "Allows opting in to see latest designs for the homepage redesign project, ahead of the release date in September 2024",
      owners = Seq(Owner.withGithub("cemms1")),
      sellByDate = LocalDate.of(2024, 9, 30),
      participationGroup = Perc0D,
    )
