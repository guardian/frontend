package experiments

import conf.switches.{Owner, SwitchGroup}
import experiments.ParticipationGroups._
import org.joda.time.LocalDate

object ActiveExperiments extends ExperimentsDefinition {
  override val allExperiments: Set[Experiment] = Set(
    OldTLSSupportDeprecation,
    DotcomRendering1,
    DotcomRendering2,
    DCRBubble
  )

  implicit val canCheckExperiment = new CanCheckExperiment(this)
}

object OldTLSSupportDeprecation extends Experiment(
  name = "old-tls-support-deprecation",
  description = "This will turn on a deprecation notice to any user who is accessing our site using TLS v1.0 or v1.1",
  owners = Seq(Owner.withGithub("siadcock")),
  sellByDate = new LocalDate(2020, 6, 17),
  // Custom group based on header set in Fastly
  participationGroup = TLSSupport
)

object DotcomRendering1 extends Experiment(
  name = "dotcom-rendering-1",
  description = "Show DCR pages to users including those with comments (1)",
  owners = Seq(Owner.withGithub("shtukas")),
  sellByDate = new LocalDate(2020, 12, 1),
  participationGroup = Perc20A // Also see ArticlePicker.scala - our main filter mechanism is by page features
)

object DotcomRendering2 extends Experiment(
  name = "dotcom-rendering-2",
  description = "Show DCR pages to users including those with comments (2)",
  owners = Seq(Owner.withGithub("shtukas")),
  sellByDate = new LocalDate(2020, 12, 1),
  participationGroup = Perc10A // Also see ArticlePicker.scala - our main filter mechanism is by page features
)

object DCRBubble extends Experiment(
  name = "always-dcr-rendering",
  description = "Use DCR for all article pages (equivalent to always adding ?dcr)",
  owners = Seq(Owner.withGithub("shtukas")),
  sellByDate = new LocalDate(2020, 12, 1),
  participationGroup = Perc0B // Also see ArticlePicker.scala - our main filter mechanism is by page features
)
