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
      UseSourcepointPropertyId,
      LiveBlogTopSponsorship,
      DarkModeWeb,
      UpdatedHeaderDesign,
      MastheadWithHighlights,
      TagLinkDesign,
    )
  implicit val canCheckExperiment: CanCheckExperiment = new CanCheckExperiment(this)
}

object UseSourcepointPropertyId
    extends Experiment(
      name = "use-sourcepoint-property-id",
      description = "Use Sourcepoint propertyId instead of propertyHref",
      owners = Seq(Owner.withGithub("commercial.dev@theguardian.com")),
      sellByDate = LocalDate.of(2024, 7, 30),
      participationGroup = Perc5A,
    )

object LiveBlogTopSponsorship
    extends Experiment(
      name = "live-blog-top-sponsorship",
      description = "Test a new sponsorship slot at the top of live blogs",
      owners = Seq(Owner.withGithub("commercial.dev@theguardian.com")),
      sellByDate = LocalDate.of(2024, 7, 30),
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

object DarkModeWeb
    extends Experiment(
      name = "dark-mode-web",
      description = "Enable dark mode on web",
      owners = Seq(Owner.withGithub("jakeii"), Owner.withGithub("mxdvl")),
      sellByDate = LocalDate.of(2024, 7, 30),
      participationGroup = Perc0D,
    )

object TagLinkDesign
    extends Experiment(
      name = "tag-link-design",
      description = "Render an updated sticky design for tag links",
      owners = Seq(Owner.withGithub("dotcom.platform@theguardian.com")),
      sellByDate = LocalDate.of(2024, 7, 25),
      participationGroup = Perc20A,
    )
