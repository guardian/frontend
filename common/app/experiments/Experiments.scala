package experiments

import conf.switches.Owner
import conf.switches.Owner.group
import conf.switches.SwitchGroup.Commercial
import conf.switches.Switches.{GarnettHeaderLaunch, GarnettLaunch}
import experiments.ParticipationGroups._
import org.joda.time.LocalDate
import play.api.mvc.RequestHeader

object ActiveExperiments extends ExperimentsDefinition {
  val allExperiments: Set[Experiment] = Set(
    CommercialClientLogging,
    CommercialPaidContentTemplate,
    CommercialBaseline,
    GarnettHeader,
    Garnett,
    HideShowMoreButtonExperiment,
    Prebid
  )
  implicit val canCheckExperiment = new CanCheckExperiment(this)
}

object CommercialClientLogging extends Experiment(
  name = "commercial-client-logging",
  description = "A slice of the audience who will post their commercial js performance data",
  owners = Seq(Owner.withGithub("rich-nguyen")),
  sellByDate = new LocalDate(2018, 2, 1),
  participationGroup = Perc1A
) {
  override def priorCondition(implicit request: RequestHeader): Boolean = CommercialBaseline.switch.isSwitchedOn
}

object CommercialPaidContentTemplate extends Experiment(
  name = "commercial-paid-content",
  description = "A slice of the audience who will see labs content with a background colour variant",
  owners = Seq(Owner.withGithub("rich-nguyen")),
  sellByDate = new LocalDate(2018, 2, 1),
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


object GarnettHeader extends Experiment(
  name = "garnett-header",
  description = "Users in this experiment will see the new desktop design, but with garnett styling",
  owners = Seq(Owner.withGithub("natalialkb"), Owner.withGithub("zeftilldeath")),
  sellByDate = new LocalDate(2018, 2, 1),
  participationGroup = Perc0A
) {
  override def isParticipating[A](implicit request: RequestHeader, canCheck: CanCheckExperiment): Boolean = super.isParticipating || GarnettHeaderLaunch.isSwitchedOn
}

object Garnett extends Experiment(
  name = "garnett",
  description = "Users in this experiment will see garnet styling.",
  owners = Seq(Owner.withName("dotcom.platform")),
  sellByDate = new LocalDate(2018, 2, 1),
  participationGroup= Perc0C
) {
  override def isParticipating[A](implicit request: RequestHeader, canCheck: CanCheckExperiment): Boolean = super.isParticipating || GarnettLaunch.isSwitchedOn
}

object HideShowMoreButtonExperiment extends Experiment(
  name = "remove-show-more-ab",
  description = "Users in this experiment will not see the show more button on front collections",
  owners = Seq(Owner.withGithub("Quarpt")),
  sellByDate = new LocalDate(2018, 2, 1),
  participationGroup = Perc5A
)

object Prebid extends Experiment(
  name = "prebid",
  description = "Users in this experiment will have a Prebid header-bidding experience.",
  owners = group(Commercial),
  sellByDate = new LocalDate(2018, 2, 21),
  participationGroup = Perc5A
)
