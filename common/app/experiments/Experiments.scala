package experiments

import conf.switches.{Owner, SwitchGroup}
import experiments.ParticipationGroups._
import org.joda.time.LocalDate
import conf.switches.Owner.group
import conf.switches.SwitchGroup.Commercial

object ActiveExperiments extends ExperimentsDefinition {
  override val allExperiments: Set[Experiment] = Set(
    OldTLSSupportDeprecation,
    DotcomRendering,
    DCRBubble,
    NGInteractiveDCR,
    NewsletterEmbedDesign,
    UseAusCmp,
  )

  implicit val canCheckExperiment = new CanCheckExperiment(this)
}

object OldTLSSupportDeprecation
    extends Experiment(
      name = "old-tls-support-deprecation",
      description =
        "This will turn on a deprecation notice to any user who is accessing our site using TLS v1.0 or v1.1",
      owners = Seq(Owner.withGithub("siadcock")),
      sellByDate = new LocalDate(2020, 11, 11),
      // Custom group based on header set in Fastly
      participationGroup = TLSSupport,
    )

object DotcomRendering
    extends Experiment(
      name = "dotcom-rendering",
      description = "Show DCR pages to users including those with comments",
      owners = Seq(Owner.withGithub("shtukas")),
      sellByDate = new LocalDate(2020, 12, 1),
      participationGroup = Perc50, // Also see ArticlePicker.scala - our main filter mechanism is by page features
    )

object DCRBubble
    extends Experiment(
      name = "always-dcr-rendering",
      description = "Use DCR for all article pages (equivalent to always adding ?dcr)",
      owners = Seq(Owner.withGithub("shtukas")),
      sellByDate = new LocalDate(2021, 6, 1),
      participationGroup = Perc0A, // Also see ArticlePicker.scala - our main filter mechanism is by page features
    )

object NGInteractiveDCR
    extends Experiment(
      name = "ng-interactive-dcr",
      description = "Use DCR to render (ng)-interactives",
      owners = Seq(Owner.withGithub("shtukas")),
      sellByDate = new LocalDate(2021, 6, 1),
      participationGroup = Perc0B,
    )

object NewsletterEmbedDesign
    extends Experiment(
      name = "new-newsletter-embed-designs",
      description = "New newsletter signup embeds for discoverability OKR",
      owners = Seq(Owner.withGithub("buck06191")),
      sellByDate = new LocalDate(2020, 11, 2),
      participationGroup = Perc0C,
    )

object UseAusCmp
    extends Experiment(
      name = "use-aus-cmp",
      description = "Use AU framework in CMP in Australia",
      owners = group(Commercial),
      sellByDate = new LocalDate(2020, 11, 6),
      participationGroup = Perc0D,
    )
