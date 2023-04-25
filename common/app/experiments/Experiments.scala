package experiments

import conf.switches.Owner
import experiments.ParticipationGroups._
import java.time.LocalDate

object ActiveExperiments extends ExperimentsDefinition {
  override val allExperiments: Set[Experiment] =
    Set(
      DCRFronts,
      OfferHttp3,
      EuropeNetworkFront,
      DCRJavascriptBundle,
      HeaderTopBarSearchCapi,
      ServerSideLiveblogInlineAds,
      FrontsBannerAds,
    )
  implicit val canCheckExperiment = new CanCheckExperiment(this)
}

object DCRJavascriptBundle
    extends Experiment(
      name = "dcr-javascript-bundle",
      description = "DCR Javascript bundle experiment",
      owners = Seq(Owner.withGithub("guardian/dotcom-platform")),
      sellByDate = LocalDate.of(2024, 4, 1),
      participationGroup = Perc1A,
    )

object DCRFronts
    extends Experiment(
      name = "dcr-fronts",
      description = "Use DCR for fronts",
      owners = Seq(Owner.withGithub("@guardian/dotcom-platform")),
      sellByDate = LocalDate.of(2023, 6, 2),
      participationGroup = Perc50,
    )

object OfferHttp3
    extends Experiment(
      name = "offer-http3",
      description = "Offer HTTP3 by providing the header and redirecting URLs to enable loading of assets with HTTP3",
      owners = Seq(Owner.withGithub("paulmr")),
      sellByDate = LocalDate.of(2023, 6, 5),
      participationGroup = Perc0B,
    )

object EuropeNetworkFront
    extends Experiment(
      name = "europe-network-front",
      description = "Test new europe network front",
      owners = Seq(Owner.withGithub("rowannekabalan")),
      sellByDate = LocalDate.of(2023, 5, 31),
      participationGroup = Perc0D,
    )

object HeaderTopBarSearchCapi
    extends Experiment(
      name = "header-top-bar-search-capi",
      description = "Adds CAPI search to the top nav",
      owners = Seq(Owner.withGithub("@guardian/dotcom-platform")),
      sellByDate = LocalDate.of(2023, 6, 6),
      participationGroup = Perc1B,
    )

object ServerSideLiveblogInlineAds
    extends Experiment(
      name = "server-side-liveblog-inline-ads",
      description =
        "Test whether we can load liveblog inline ads server-side without negative effects on user experience or revenue",
      owners = Seq(Owner.withGithub("@guardian/commercial-dev")),
      sellByDate = LocalDate.of(2023, 6, 1),
      participationGroup = Perc5A,
    )

object FrontsBannerAds
    extends Experiment(
      name = "fronts-banner-ads",
      description = "Creates a new ad experience on fronts pages",
      owners = Seq(Owner.withGithub("@guardian/commercial-dev")),
      sellByDate = LocalDate.of(2023, 9, 6),
      participationGroup = Perc0A,
    )

object TenImageSlideshows
    extends Experiment(
      name = "ten-image-slideshows",
      description = "Test the impact of including 10 images in a slidehow rather than 5",
      owners = Seq(Owner.withGithub("@guardian/editorial-experience")),
      sellByDate = LocalDate.of(2023, 5, 15),
      participationGroup = Perc50,
    )
