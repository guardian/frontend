package experiments

import conf.switches.Owner
import experiments.ParticipationGroups._

import java.time.LocalDate

/*
 * This list of active experiments is sorted by participation group.
 */
object ActiveExperiments extends ExperimentsDefinition {
  override val allExperiments: Set[Experiment] =
    Set(
      FrontsBannerAdsDcr,
      Lightbox,
      ServerSideLiveblogInlineAds,
      EuropeNetworkFront,
      Okta,
      HeaderTopBarSearchCapi,
      LazyLoadImages,
      AdaptiveSite,
      OfferHttp3,
      DeeplyRead,
    )
  implicit val canCheckExperiment = new CanCheckExperiment(this)
}

object FrontsBannerAdsDcr
    extends Experiment(
      name = "fronts-banner-ads-dcr",
      description = "Creates a new ad experience on fronts pages, replacing MPUs with banner ads",
      owners = Seq(Owner.withGithub("@guardian/commercial-dev")),
      sellByDate = LocalDate.of(2023, 9, 1),
      participationGroup = Perc0A,
    )

object Lightbox
    extends Experiment(
      name = "lightbox",
      description = "Testing the impact lightbox might have on our CWVs",
      owners = Seq(Owner.withGithub("@guardian/dotcom-platform")),
      sellByDate = LocalDate.of(2023, 9, 29),
      participationGroup = Perc0B,
    )

object ServerSideLiveblogInlineAds
    extends Experiment(
      name = "server-side-liveblog-inline-ads",
      description =
        "Test whether we can load liveblog inline ads server-side without negative effects on user experience or revenue",
      owners = Seq(Owner.withGithub("@guardian/commercial-dev")),
      sellByDate = LocalDate.of(2023, 9, 1),
      participationGroup = Perc0C,
    )

object EuropeNetworkFront
    extends Experiment(
      name = "europe-network-front",
      description = "Test new europe network front",
      owners = Seq(Owner.withGithub("rowannekabalan")),
      sellByDate = LocalDate.of(2023, 8, 31),
      participationGroup = Perc0D,
    )

object Okta
    extends Experiment(
      name = "okta",
      description = "Use Okta for authentication",
      owners = Seq(Owner.withGithub("@guardian/dotcom-platform")),
      sellByDate = LocalDate.of(2023, 8, 31),
      /* Do not increase without considering if
       - https://github.com/guardian/dotcom-rendering/pull/8508
       - https://github.com/guardian/frontend/pull/26461
      needs to be reverted */
      participationGroup = Perc1C,
    )

// Removing while we are still implementing this content type in DCR
//object DCRImageContent
//    extends Experiment(
//      name = "dcr-image-content",
//      description = "Use DCR for image content",
//      owners = Seq(Owner.withGithub("@guardian/dotcom-platform")),
//      sellByDate = LocalDate.of(2024, 1, 1),
//      participationGroup = Perc0E,
//    )

object AdaptiveSite
    extends Experiment(
      name = "adaptive-site",
      description = "Enables serving an adaptive version of the site that responds to page performance",
      owners = Seq(Owner.withName("Open Journalism")),
      sellByDate = LocalDate.of(2023, 12, 5),
      participationGroup = Perc1A,
    )

object HeaderTopBarSearchCapi
    extends Experiment(
      name = "header-top-bar-search-capi",
      description = "Adds CAPI search to the top nav",
      owners = Seq(Owner.withGithub("@guardian/dotcom-platform")),
      sellByDate = LocalDate.of(2023, 9, 6),
      participationGroup = Perc1B,
    )

object LazyLoadImages
    extends Experiment(
      name = "lazy-load-images",
      description = "Lazy-load images on DCR",
      owners = Seq(Owner.withGithub("@mxdvl")),
      sellByDate = LocalDate.of(2023, 8, 22),
      participationGroup = Perc1C,
    )

object OfferHttp3
    extends Experiment(
      name = "offer-http3",
      description = "Offer HTTP3 by providing the header and redirecting URLs to enable loading of assets with HTTP3",
      owners = Seq(Owner.withGithub("paulmr")),
      sellByDate = LocalDate.of(2023, 8, 31),
      participationGroup = Perc1E,
    )

object DeeplyRead
    extends Experiment(
      name = "deeply-read",
      description = "When ON, deeply read footer section is displayed",
      owners = Seq(Owner.withGithub("@guardian/dotcom-platform")),
      sellByDate = LocalDate.of(2023, 10, 31),
      participationGroup = Perc50,
    )
