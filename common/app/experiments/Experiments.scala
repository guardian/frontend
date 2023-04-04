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
      PoorDeviceConnectivity,
      FastlyNextGenWAF,
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
      participationGroup = Perc5A,
    )

object OfferHttp3
    extends Experiment(
      name = "offer-http3",
      description = "Offer HTTP3 by providing the header and redirecting URLs to enable loading of assets with HTTP3",
      owners = Seq(Owner.withGithub("paulmr")),
      sellByDate = LocalDate.of(2023, 4, 28),
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
      participationGroup = Perc0A,
    )

object PoorDeviceConnectivity
    extends Experiment(
      name = "poor-device-connectivity",
      description = "Reduce the load of the site for users experiencing poor device connectivity",
      owners = Seq(Owner.withEmail("open.journalism@theguardian.com")),
      sellByDate = LocalDate.of(2023, 4, 4),
      participationGroup = Perc20A,
    ) {
  override val extraHeader = Some(ExperimentHeader("X-GU-Poor-Device-Connectivity", "true"))
}

object FastlyNextGenWAF
    extends Experiment(
      name = "fastly-next-gen-waf",
      description =
        "We're using a participation group that we don't want other people to use. The experiment is used as a placeholder because the actual switch is happening at the Fastly level. PR here: https://github.com/guardian/fastly-edge-cache/pull/966",
      owners = Seq(Owner.withGithub("@guardian/dotcom-platform")),
      sellByDate = LocalDate.of(2023, 6, 2),
      participationGroup = Perc10A,
    )
