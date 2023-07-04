package experiments

import conf.switches.Owner
import experiments.ParticipationGroups._
import java.time.LocalDate

object ActiveExperiments extends ExperimentsDefinition {
  override val allExperiments: Set[Experiment] =
    Set(
      FrontsBannerAds,
      DCRNetworkFronts,
      ServerSideLiveblogInlineAds,
      EuropeNetworkFront,
      OfferHttp3,
      Okta,
      HeaderTopBarSearchCapi,
      BorkFCP,
      BorkFID,
      ActionCardRedesign,
      VerticalVideoContainer,
    )
  implicit val canCheckExperiment = new CanCheckExperiment(this)
}

object Lightbox
    extends Experiment(
      name = "lightbox",
      description = "Testing the impact lightbox might have on our CWVs",
      owners = Seq(Owner.withGithub("@guardian/dotcom-platform")),
      sellByDate = LocalDate.of(2023, 9, 29),
      participationGroup = Perc0A,
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
      sellByDate = LocalDate.of(2023, 7, 24),
      participationGroup = Perc0E,
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

object DCRNetworkFronts
    extends Experiment(
      name = "dcr-network-fronts",
      description = "Network fronts rendered by DCR",
      owners = Seq(Owner.withGithub("@guardian/dotcom-platform")),
      sellByDate = LocalDate.of(2023, 7, 3),
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

object BorkFCP
    extends Experiment(
      name = "bork-fcp",
      description = "Synthetically degrades First Contentful Paint (FCP)",
      owners = Seq(Owner.withName("Open Journalism")),
      sellByDate = LocalDate.of(2023, 8, 1),
      participationGroup = Perc1C,
    )

object BorkFID
    extends Experiment(
      name = "bork-fid",
      description = "Synthetically degrades First Input Delay (FID)",
      owners = Seq(Owner.withName("Open Journalism")),
      sellByDate = LocalDate.of(2023, 8, 1),
      participationGroup = Perc1D,
    )

object OfferHttp3
    extends Experiment(
      name = "offer-http3",
      description = "Offer HTTP3 by providing the header and redirecting URLs to enable loading of assets with HTTP3",
      owners = Seq(Owner.withGithub("paulmr")),
      sellByDate = LocalDate.of(2023, 7, 3),
      participationGroup = Perc1E,
    )

object FrontsBannerAds
    extends Experiment(
      name = "fronts-banner-ads",
      description = "Creates a new ad experience on fronts pages",
      owners = Seq(Owner.withGithub("@guardian/commercial-dev")),
      sellByDate = LocalDate.of(2023, 9, 6),
      participationGroup = Perc5A,
    )

object ActionCardRedesign
    extends Experiment(
      name = "action-card-redesign",
      description = "Creates a new action card design on fronts pages",
      owners = Seq(Owner.withGithub("@guardian/editorial-experience")),
      sellByDate = LocalDate.of(2023, 9, 8),
      participationGroup = Perc20A,
    )

object VerticalVideoContainer
    extends Experiment(
      name = "vertical-video-container",
      description = "When ON, Vertical Video Container is displayed",
      owners = Seq(Owner.withGithub("@guardian/editorial-experience")),
      sellByDate = LocalDate.of(2023, 7, 31),
      participationGroup = Perc0A,
    )
