package experiments

import conf.switches.{Owner, SwitchGroup}
import experiments.ParticipationGroups._
import org.joda.time.LocalDate
import play.api.mvc.RequestHeader

object ActiveExperiments extends ExperimentsDefinition {
  override val allExperiments: Set[Experiment] = Set(
    AudioPageChange,
    CommercialClientLogging,
    OrielParticipation,
    LotameParticipation,
    OldTLSSupportDeprecation,
  )
  implicit val canCheckExperiment = new CanCheckExperiment(this)
}

object CommercialClientLogging extends Experiment(
  name = "commercial-client-logging",
  description = "A slice of the audience who will post their commercial js performance data",
  owners = Owner.group(SwitchGroup.Commercial),
  sellByDate = new LocalDate(2018, 8, 1),
  participationGroup = Perc1A
)

object OrielParticipation extends Experiment(
  name = "oriel-participation",
  description = "A slice of the audience who will participate in Oriel ad-blocking technology",
  owners = Seq(Owner.withGithub("janua")),
  sellByDate = new LocalDate(2018, 9, 12),
  participationGroup = Perc20A
)

object LotameParticipation extends Experiment(
  name = "lotame-participation",
  description = "A slice of the audience who will participate in Lotame tracking",
  owners = Seq(Owner.withGithub("janua")),
  sellByDate = new LocalDate(2018, 9, 12),
  participationGroup = Perc1D
)

object OldTLSSupportDeprecation extends Experiment(
  name = "old-tls-support-deprecation",
  description = "This will turn on a deprecation notice to any user who is accessing our site using TLS v1.0 or v1.1",
  owners = Seq(Owner.withGithub("natalialkb")),
  sellByDate = new LocalDate(2019, 1,15),
  // Custom group based on header set in Fastly
  participationGroup = TLSSupport
)

object AudioPageChange extends Experiment(
  name = "audio-page-change",
  description = "Show a different version of the audio page to certain people",
  owners = Owner.group(SwitchGroup.Journalism),
  sellByDate = new LocalDate(2018, 7, 20),
  participationGroup = Perc50
)
