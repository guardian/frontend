package experiments

import conf.switches.{Owner, SwitchGroup}
import experiments.ParticipationGroups._
import org.joda.time.LocalDate
import play.api.mvc.RequestHeader
import conf.switches.Switches.IdentityShowOptInEngagementBanner

object ActiveExperiments extends ExperimentsDefinition {
  override val allExperiments: Set[Experiment] = Set(
    CommercialClientLogging,
    CommercialBaseline,
    CommercialAdRefresh,
    MoonLambda,
    OrielParticipation,
    GdprOptinAlert,
    LotameParticipation
  )
  implicit val canCheckExperiment = new CanCheckExperiment(this)
}

object CommercialClientLogging extends Experiment(
  name = "commercial-client-logging",
  description = "A slice of the audience who will post their commercial js performance data",
  owners = Owner.group(SwitchGroup.Commercial),
  sellByDate = new LocalDate(2018, 5, 31),
  participationGroup = Perc1A
)

object CommercialBaseline extends Experiment(
  name = "commercial-baseline",
  description = "Users in this experiment will experience the commercial javascript stack as of 2018-01-01.",
  owners = Seq(Owner.withGithub("katebee"), Owner.withGithub("shtukas")),
  sellByDate = new LocalDate(2018, 4, 11),
  participationGroup = Perc2B
)

object CommercialAdRefresh extends Experiment(
  name = "commercial-ad-refresh",
  description = "Users in this experiment will have their ad slots refreshed after 30 seconds",
  owners = Seq(Owner.withGithub("katebee")),
  sellByDate = new LocalDate(2018, 4, 26),
  participationGroup = Perc20A
)

object MoonLambda extends Experiment(
  name = "moon-lambda",
  description = "Users in this experiment will see 404 page rendered by a lambda",
  owners = Seq(Owner.withGithub("siadcock")),
  sellByDate = new LocalDate(2018, 4, 9),
  participationGroup = Perc1B
)

object OrielParticipation extends Experiment(
  name = "oriel-participation",
  description = "A slice of the audience who will participate in Oriel ad-blocking technology",
  owners = Seq(Owner.withGithub("janua")),
  sellByDate = new LocalDate(2018, 6, 28),
  participationGroup = Perc1C
)

object GdprOptinAlert extends Experiment(
  name = "gdpr-optin-alert",
  description = "Audience who will see the Stay with us alert",
  owners = Seq(Owner.withGithub("walaura")),
  sellByDate = new LocalDate(2018, 6, 25), // GDPR goes into effect + 1 month
  participationGroup = Perc0E
) {
  override def isParticipating[A](implicit request: RequestHeader, canCheck: CanCheckExperiment): Boolean = super.isParticipating || IdentityShowOptInEngagementBanner.isSwitchedOn
}

object LotameParticipation extends Experiment(
  name = "lotame-participation",
  description = "A slice of the audience who will participate in Lotame tracking",
  owners = Seq(Owner.withGithub("janua")),
  sellByDate = new LocalDate(2018, 6, 28),
  participationGroup = Perc1D
)
