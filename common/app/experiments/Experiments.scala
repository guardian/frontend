package experiments

import conf.switches.{Owner, SwitchGroup}
import experiments.ParticipationGroups._
import org.joda.time.LocalDate

object ActiveExperiments extends ExperimentsDefinition {
  override val allExperiments: Set[Experiment] = Set(
    OldTLSSupportDeprecation,
    LazyLoadImages
  )
  implicit val canCheckExperiment = new CanCheckExperiment(this)
}

object OldTLSSupportDeprecation extends Experiment(
  name = "old-tls-support-deprecation",
  description = "This will turn on a deprecation notice to any user who is accessing our site using TLS v1.0 or v1.1",
  owners = Seq(Owner.withGithub("siadcock")),
  sellByDate = new LocalDate(2019, 7, 18),
  // Custom group based on header set in Fastly
  participationGroup = TLSSupport
)

object LazyLoadImages extends Experiment(
  name = "lazy-load-images",
  description = "Lazy-loaded non-main images for participants on fronts as images approach the viewport",
  owners = Seq(Owner.withGithub("nicl")),
  sellByDate = new LocalDate(2019, 6, 4),
  participationGroup = Perc0A
)
