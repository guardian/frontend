package experiments

import conf.switches.Owner
import experiments.ParticipationGroups._
import java.time.LocalDate

object ActiveExperiments extends ExperimentsDefinition {
  override val allExperiments: Set[Experiment] =
    Set(DCRFronts, OfferHttp3, LiveBlogMainMediaPosition, TableOfContents, CommercialEndOfQuarterMegaTest, EuropeNetworkFront)
  implicit val canCheckExperiment = new CanCheckExperiment(this)
}

object DCRJSBundleVariant
    extends Experiment(
      name = "dcr-js-bundle-variant",
      description = "DCR bundle experiment",
      owners = Seq(Owner.withGithub("guardian/dotcom-platform")),
      sellByDate = LocalDate.of(2024, 4, 1),
      participationGroup = Perc1A,
    )

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

object DCROnwardsData
    extends Experiment(
      name = "dcr-onwards-data",
      // DCR will already render the data if we send it down the pipes.
      // This will allow us to iterate on the feature.
      // see: https://github.com/guardian/dotcom-rendering/blob/b649a00fc9e5d2ba158f82b7c4b152106579f6a9/dotcom-rendering/src/web/layouts/StandardLayout.tsx#L793-L798
      description = "Switch to iterate on adding onwards data to be sent to DCR to be server rendered",
      owners = Seq(Owner.withGithub("guardian/dotcom-platform")),
      sellByDate = LocalDate.of(2023, 6, 2),
      participationGroup = Perc0C,
    )

object EuropeNetworkFront
    extends Experiment(
      name = "europe-network-front",
      description = "Test new europe network front",
      owners = Seq(Owner.withGithub("rowannekabalan")),
      sellByDate = LocalDate.of(2022, 9, 30),
      participationGroup = Perc0D,
    )
