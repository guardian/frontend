package experiments

import conf.switches.Owner
import experiments.ParticipationGroups._
import org.joda.time.LocalDate
import play.api.mvc.RequestHeader

object ActiveExperiments extends ExperimentsDefinition {
  override val allExperiments: Set[Experiment] = Set(
    CommercialClientLogging,
    CommercialPaidContentTemplate,
    CommercialBaseline,
    CommercialAdRefresh,
    MoonLambda,
    OrielParticipation
  )
  implicit val canCheckExperiment = new CanCheckExperiment(this)
}

object CommercialClientLogging extends Experiment(
  name = "commercial-client-logging",
  description = "A slice of the audience who will post their commercial js performance data",
  owners = Seq(Owner.withGithub("rich-nguyen")),
  sellByDate = new LocalDate(2018, 2, 28),
  participationGroup = Perc1A
)

object CommercialPaidContentTemplate extends Experiment(
  name = "commercial-paid-content",
  description = "A slice of the audience who will see labs content with a background colour variant",
  owners = Seq(Owner.withGithub("rich-nguyen")),
  sellByDate = new LocalDate(2018, 2, 28),
  participationGroup = Perc50
) {

  override def priorCondition(implicit request: RequestHeader): Boolean = testUrls.contains(request.path)
  override val extraHeader: Option[ExperimentHeader] = Some(ExperimentHeader("X-GU-From-GB", "true"))

  private val testUrls = List(
    "/discover-cool-canada/2017/sep/25/can-you-tell-a-canadien-from-a-canuck-test-your-canadian-sport-knowledge-quiz",
    "/discover-cool-canada/2017/sep/18/poutine-and-beyond-10-local-eats-you-have-to-try-when-youre-in-canada",
    "/discover-cool-canada/2017/sep/07/lights-canada-action-why-film-makers-are-heading-north-of-the-us-border",
    "/discover-cool-canada/2017/sep/04/canada-is-one-of-the-coolest-countries-on-the-planet-if-you-want-proof-take-a-look-at-its-festivals",
    "/discover-cool-canada/2017/sep/04/canadas-10-most-electrifying-sports-venues",
    "/discover-cool-canada/gallery/2016/sep/09/your-guide-to-canada-in-pictures",
    "/discover-canal-river-trust/2017/oct/20/top-10-waterside-places-to-enjoy-in-autumn"
  )
}

object CommercialBaseline extends Experiment(
  name = "commercial-baseline",
  description = "Users in this experiment will experience the commercial javascript stack as of 2018-01-01.",
  owners = Seq(Owner.withGithub("JonNorman"), Owner.withGithub("shtukas")),
  sellByDate = new LocalDate(2018, 4, 11),
  participationGroup = Perc2B
)

object CommercialAdRefresh extends Experiment(
  name = "commercial-ad-refresh",
  description = "Users in this experiment will have their ad slots refreshed after 30 seconds",
  owners = Seq(Owner.withGithub("JonNorman")),
  sellByDate = new LocalDate(2018, 4, 11),
  participationGroup = Perc5A
)

object MoonLambda extends Experiment(
  name = "moon-lambda",
  description = "Users in this experiment will see 404 page rendered by a lambda",
  owners = Seq(Owner.withGithub("siadcock")),
  sellByDate = new LocalDate(2018, 2, 28),
  participationGroup = Perc1B
)

object OrielParticipation extends Experiment(
  name = "oriel-participation",
  description = "A slice of the audience who will participate in Oriel ad-blocking technology",
  owners = Seq(Owner.withGithub("janua")),
  sellByDate = new LocalDate(2018, 6, 28),
  participationGroup = Perc1C
)
