package experiments

import conf.switches.{Owner, SwitchGroup}
import experiments.ParticipationGroups._
import org.joda.time.LocalDate

object ActiveExperiments extends ExperimentsDefinition {
  override val allExperiments: Set[Experiment] = Set(
    OldTLSSupportDeprecation,
    DotcomRenderingAdvertisements
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

object DotcomRenderingAdvertisements extends Experiment(
  name = "dotcom-rendering-advertisements",
  description = "Activate the display of ads on DCR pages",
  owners = Seq(Owner.withGithub("shtukas")),
  sellByDate = new LocalDate(2020, 12, 1),
  participationGroup = Perc1A // see ArticlePicker.scala - our main filter mechanism is by page features
)
