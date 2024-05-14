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
      DCRTagPages,
      DCRVideoPages,
      UpdatedHeaderDesign,
      MastheadWithHighlights,
      AffiliateLinksDCR,
    )
  implicit val canCheckExperiment: CanCheckExperiment = new CanCheckExperiment(this)
}

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

object DarkModeWeb
    extends Experiment(
      name = "dark-mode-web",
      description = "Enable dark mode on web",
      owners = Seq(Owner.withGithub("jakeii"), Owner.withGithub("mxdvl")),
      sellByDate = LocalDate.of(2024, 7, 30),
      participationGroup = Perc0D,
    )

object AffiliateLinksDCR
    extends Experiment(
      name = "affiliate-links-dcr",
      description = "Display affiliate links on all eligible DCR articles",
      owners = Seq(Owner.withGithub("commercial.dev@theguardian.com")),
      sellByDate = LocalDate.of(2024, 7, 30),
      participationGroup = Perc0E,
    )

object DCRVideoPages
    extends Experiment(
      name = "dcr-video-pages",
      description = "Render video pages with DCR",
      owners = Seq(
        Owner.withGithub("commercial.dev@theguardian.com"),
        Owner.withGithub("dotcom.platform@theguardian.com"),
      ),
      sellByDate = LocalDate.of(2024, 5, 30),
      participationGroup = Perc10A,
    )

object DCRTagPages
    extends Experiment(
      name = "dcr-tag-pages",
      description = "Render tag pages with DCR",
      owners = Seq(Owner.withGithub("dotcom.platform@theguardian.com")),
      sellByDate = LocalDate.of(2024, 5, 31),
      participationGroup = Perc20A,
    )
