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
    OldTLSSupportDeprecation,
    HeaderSubscribeUKTest
  )
  implicit val canCheckExperiment = new CanCheckExperiment(this)
}

object CommercialClientLogging extends Experiment(
  name = "commercial-client-logging",
  description = "A slice of the audience who will post their commercial js performance data",
  owners = Owner.group(SwitchGroup.Commercial),
  sellByDate = new LocalDate(2018, 11, 21),
  participationGroup = Perc1A
)

object OrielParticipation extends Experiment(
  name = "oriel-participation",
  description = "A slice of the audience who will participate in Oriel ad-blocking technology",
  owners = Seq(Owner.withGithub("janua")),
  sellByDate = new LocalDate(2018, 11, 29),
  participationGroup = Perc20A
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
  sellByDate = new LocalDate(2018, 12, 5),
  participationGroup = Perc0B
)

object HeaderSubscribeUKTest extends Experiment(
  name = "header-subscribe-uk-test",
  description = "We're changing the order and destination of the contribution and subscribe links in order to see if we can improve the subscription revenue",
  owners = Seq(Owner.withGithub("rcrphillips")),
  sellByDate = new LocalDate(2018, 11, 30),
  participationGroup = Perc50
)
