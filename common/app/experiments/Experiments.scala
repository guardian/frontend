package experiments

import conf.switches.Owner
import experiments.ParticipationGroups._
import java.time.LocalDate

object ActiveExperiments extends ExperimentsDefinition {
  override val allExperiments: Set[Experiment] =
    Set(DCRFronts, OfferHttp3, LiveBlogMainMediaPosition, TableOfContents, CommercialEndOfQuarterMegaTest)
  implicit val canCheckExperiment = new CanCheckExperiment(this)
}

object DCRFronts
    extends Experiment(
      name = "dcr-fronts",
      description = "Use DCR for fronts",
      owners = Seq(Owner.withGithub("dotcom")),
      sellByDate = LocalDate.of(2023, 6, 2),
      participationGroup = Perc0A,
    )

object OfferHttp3
    extends Experiment(
      name = "offer-http3",
      description = "Offer HTTP3 by providing the header and redirecting URLs to enable loading of assets with HTTP3",
      owners = Seq(Owner.withGithub("paulmr")),
      sellByDate = LocalDate.of(2022, 12, 6),
      participationGroup = Perc0B,
    )

object LiveBlogMainMediaPosition
    extends Experiment(
      name = "live-blog-main-media-position",
      description = "When ON, main media will be positioned between the kicker and headline on liveblogs",
      owners = Seq(Owner.withGithub("abeddow91")),
      sellByDate = LocalDate.of(2022, 10, 7),
      participationGroup = Perc50,
    )

object TableOfContents
    extends Experiment(
      name = "table-of-contents",
      description = "When ON, a table of contents will be rendered for qualifying articles",
      owners = Seq(Owner.withName("journalism team")),
      sellByDate = LocalDate.of(2022, 12, 7),
      participationGroup = Perc0C,
    )

object CommercialEndOfQuarterMegaTest
    extends Experiment(
      name = "commercial-end-of-quarter-mega-test",
      description = "Measure the revenue uplift of the various changes introduced by the commercial team in Q1",
      owners = Seq(Owner.withGithub("commercial-dev")),
      sellByDate = LocalDate.of(2022, 10, 10),
      participationGroup = Perc10A,
    )
