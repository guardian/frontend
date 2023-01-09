package experiments

import conf.switches.Owner
import experiments.ParticipationGroups._
import java.time.LocalDate

object ActiveExperiments extends ExperimentsDefinition {
  override val allExperiments: Set[Experiment] =
    Set(
      DCRFronts,
      OfferHttp3,
      TableOfContents,
      EuropeNetworkFront,
      DCRJavascriptBundle,
      HeaderTopBarSearchCapi,
      ServerSideLiveblogInlineAds,
      Callouts,
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
      participationGroup = Perc0A,
    )

object OfferHttp3
    extends Experiment(
      name = "offer-http3",
      description = "Offer HTTP3 by providing the header and redirecting URLs to enable loading of assets with HTTP3",
      owners = Seq(Owner.withGithub("paulmr")),
      sellByDate = LocalDate.of(2023, 1, 10),
      participationGroup = Perc0B,
    )

object TableOfContents
    extends Experiment(
      name = "table-of-contents",
      description = "When ON, a table of contents will be rendered for qualifying articles",
      owners = Seq(Owner.withName("journalism team")),
      sellByDate = LocalDate.of(2023, 1, 10),
      participationGroup = Perc0C,
    )

object DCROnwardsData
    extends Experiment(
      name = "dcr-onwards-data",
      // DCR will already render the data if we send it down the pipes.
      // This will allow us to iterate on the feature.
      // see: https://github.com/guardian/dotcom-rendering/blob/b649a00fc9e5d2ba158f82b7c4b152106579f6a9/dotcom-rendering/src/web/layouts/StandardLayout.tsx#L793-L798
      description = "Switch to iterate on adding onwards data to be sent to DCR to be server rendered",
      owners = Seq(Owner.withGithub("@guardian/dotcom-platform")),
      sellByDate = LocalDate.of(2023, 6, 2),
      participationGroup = Perc0C,
    )

object EuropeNetworkFront
    extends Experiment(
      name = "europe-network-front",
      description = "Test new europe network front",
      owners = Seq(Owner.withGithub("rowannekabalan")),
      sellByDate = LocalDate.of(2023, 3, 1),
      participationGroup = Perc0D,
    )

object HeaderTopBarSearchCapi
    extends Experiment(
      name = "header-top-bar-search-capi",
      description = "Adds CAPI search to the top nav",
      owners = Seq(Owner.withGithub("@guardian/dotcom-platform")),
      sellByDate = LocalDate.of(2023, 2, 1),
      participationGroup = Perc1B,
    )

object ServerSideLiveblogInlineAds
    extends Experiment(
      name = "server-side-liveblog-inline-ads",
      description =
        "Test whether we can load liveblog inline ads server-side without negative effects on user experience or revenue",
      owners = Seq(Owner.withGithub("@guardian/commercial-dev")),
      sellByDate = LocalDate.of(2023, 2, 1),
      participationGroup = Perc5A,
    )

object Callouts
    extends Experiment(
      name = "callout-elements",
      description = "When ON, callout elements will be visible",
      owners = Seq(Owner.withGithub("@guardian/editorial-experience")),
      sellByDate = LocalDate.of(2023, 6, 1),
      participationGroup = Perc0E,
    )
