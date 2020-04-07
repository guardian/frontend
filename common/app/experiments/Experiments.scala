package experiments

import conf.switches.{Owner, SwitchGroup}
import experiments.ParticipationGroups._
import org.joda.time.LocalDate

object ActiveExperiments extends ExperimentsDefinition {
  override val allExperiments: Set[Experiment] = Set(
    OldTLSSupportDeprecation,
    DotcomRendering,
    DiscussionRendering
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

object DotcomRendering extends Experiment(
  name = "dotcom-rendering",
  description = "Show DCR pages to users",
  owners = Seq(Owner.withGithub("shtukas")),
  sellByDate = new LocalDate(2020, 12, 1),
  participationGroup = Perc20A // Also see ArticlePicker.scala - our main filter mechanism is by page features
)

object DiscussionRendering extends Experiment(
  name = "discussion-rendering",
  description = "Show DCR pages to users including those with comments",
  owners = Seq(Owner.withGithub("shtukas")),
  sellByDate = new LocalDate(2020, 12, 1),
  participationGroup = Perc0A // Also see ArticlePicker.scala - our main filter mechanism is by page features
)
