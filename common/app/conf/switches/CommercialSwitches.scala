package conf.switches

import conf.switches.Expiry.never
import conf.switches.Owner.group
import conf.switches.SwitchGroup.{Commercial, CommercialPrebid, Membership}

trait CommercialSwitches {

  val CommercialSwitch = Switch(
    Commercial,
    "commercial",
    "If this switch is OFF, no calls will be made to the ad server. BEWARE!",
    owners = group(Commercial),
    safeState = On,
    sellByDate = never,
    exposeClientSide = true,
  )

  val StandaloneCommercialBundle = Switch(
    Commercial,
    "standalone-commercial-bundle",
    "Serve the standalone commercial bundle on all platforms",
    owners = group(Commercial),
    safeState = On,
    sellByDate = never,
    exposeClientSide = true,
  )

  val CarrotTrafficDriverSwitch = Switch(
    Commercial,
    "carrot-traffic-driver",
    "Enables the requesting and rendering of the carrot traffic driving component.",
    owners = Seq(Owner.withName("unknown")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true,
  )

  val IasTargetingSwitch = Switch(
    Commercial,
    "ias-ad-targeting",
    "Enables the IAS slot-targeting optimisation.",
    owners = Seq(Owner.withName("unknown")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true,
  )

  val OutbrainNewIdsSwitch = Switch(
    Commercial,
    "commercial-outbrain-newids",
    "Enable the Outbrain new IDs (Late Jan 2019)",
    owners = Seq(Owner.withName("unknown")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true,
  )

  val SurveySwitch = Switch(
    Commercial,
    "surveys",
    "For delivering surveys, enables the requesting of the out-of-page slot on non-fronts",
    owners = Seq(Owner.withName("unknown")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true,
  )

  val AdFreeStrictExpiryEnforcement = Switch(
    Commercial,
    "ad-free-strict-expiry-enforcement",
    "When ON, the ad-free cookie is valid for max. 48 hours. OFF doesn't enforce expiry check.",
    owners = Seq(Owner.withGithub("JustinPinner")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true,
  )

  val ImrWorldwideSwitch = Switch(
    Commercial,
    "imr-worldwide",
    "Enable the IMR Worldwide audience segment tracking.",
    owners = group(Commercial),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true,
  )

  val InizioSwitch = Switch(
    Commercial,
    "inizio",
    "Include the Inizio script on page so that creatives can show a survey.",
    owners = group(Commercial),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true,
  )

  val TwitterUwtSwitch = Switch(
    Commercial,
    "twitter-uwt",
    "Include the Twitter universal website tag code.",
    owners = group(Commercial),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true,
  )

  val PermutiveSwitch = Switch(
    Commercial,
    "permutive",
    "Enable Permutive library loading",
    owners = group(Commercial),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true,
  )

  val ampAmazon = Switch(
    Commercial,
    "amp-amazon",
    "Amp inventory is being auctioned through Amazon",
    owners = group(Commercial),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true,
  )

  val RemarketingSwitch = Switch(
    Commercial,
    "remarketing",
    "Enable Remarketing tracking",
    owners = group(Commercial),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true,
  )

  val SimpleReachSwitch = Switch(
    Commercial,
    "simple-reach",
    "Enable Simple Reach tracking and reporting.",
    owners = group(Commercial),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true,
  )

  val TravelFeedFetchSwitch = Switch(
    SwitchGroup.CommercialFeeds,
    "gu-travel-feed-fetch",
    "If this switch is on, cached travel offers feed will be updated from external source.",
    owners = group(Commercial),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = false,
  )

  val TravelFeedParseSwitch = Switch(
    SwitchGroup.CommercialFeeds,
    "gu-travel-feed-parse",
    "If this switch is on, commercial components will be fed by travel offers feed.",
    owners = group(Commercial),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = false,
  )

  val JobsFeedFetchSwitch = Switch(
    SwitchGroup.CommercialFeeds,
    "gu-jobs-feed-fetch",
    "If this switch is on, jobs feed will be periodically updated from external source.",
    owners = Owner.group(SwitchGroup.Commercial),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = false,
  )

  val JobsFeedParseSwitch = Switch(
    SwitchGroup.CommercialFeeds,
    "gu-jobs-feed-parse",
    "If this switch is on, commercial components will be fed by jobs feed.",
    owners = Owner.group(SwitchGroup.Commercial),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = false,
  )

  val EventsFeedSwitch = Switch(
    SwitchGroup.CommercialFeeds,
    "gu-events",
    "If this switch is on, commercial components will be fed by masterclass and live-events feeds.",
    owners = group(Commercial),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = false,
  )

  val GuBookshopFeedsSwitch = Switch(
    SwitchGroup.CommercialFeeds,
    "gu-bookshop",
    "If this switch is on, commercial components will be fed by the Guardian Bookshop feed.",
    owners = group(Commercial),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = false,
  )

  val BookLookupSwitch = Switch(
    SwitchGroup.CommercialFeeds,
    "book-lookup",
    "If this switch is on, book data will be looked up using a third-party service.",
    owners = group(Commercial),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = false,
  )

  val AdblockAsk = Switch(
    Commercial,
    "ab-adblock-ask",
    "Places a contributions ask underneath the right-hand ad slot on articles.",
    owners = group(Membership),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true,
  )

  val AffiliateLinks: Switch = Switch(
    group = Commercial,
    name = "affiliate-links",
    description =
      "Enable affiliate links. If off, affiliate links will never be added to content by frontend apps. If on, affiliate links may be added based off other settings",
    owners = group(Commercial),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = false,
  )

  val AffiliateLinkSections: Switch = Switch(
    group = Commercial,
    name = "affiliate-links-sections",
    description =
      "Add affiliate links to all content in sections in affiliateLinkSections config property when no override exists in capi (showAffiliateLinks field).",
    owners = group(Commercial),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = false,
  )

  val confiantAdVerification: Switch = Switch(
    group = Commercial,
    name = "confiant-ad-verification",
    description = "Enable Confiant ad verification",
    owners = group(Commercial),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true,
  )

  val a9HeaderBidding: Switch = Switch(
    group = CommercialPrebid,
    name = "a9-header-bidding",
    description = "Turn on A9 header bidding",
    owners = group(Commercial),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true,
  )

  val redplanetForAUSSwitch: Switch = Switch(
    group = CommercialPrebid,
    name = "redplanet-for-aus",
    description = "Turn on Redplanet in AUS",
    owners = group(Commercial),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true,
  )

  val MerchandisingHighSection: Switch = Switch(
    group = Commercial,
    name = "merchandising-high-section",
    description = "Move merchandising high section one section lower. This switch is only applied in the UK.",
    owners = group(Commercial),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = false,
  )

  val commercialMetrics: Switch = Switch(
    group = Commercial,
    name = "commercial-metrics",
    description = "Send commercial metric data to the lake via fastly",
    owners = group(Commercial),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true,
  )
}

trait PrebidSwitches {

  val prebidHeaderBidding: Switch = Switch(
    group = CommercialPrebid,
    name = "prebid-header-bidding",
    description = "Turn on Prebid header bidding (takes priority over Sonobi)",
    owners = group(Commercial),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true,
  )

  val prebidAnalytics: Switch = Switch(
    group = CommercialPrebid,
    name = "prebid-analytics",
    description = "Gather analytics from Prebid auctions",
    owners = group(Commercial),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true,
  )

  val ampPrebid: Switch = Switch(
    group = CommercialPrebid,
    name = "amp-prebid",
    description = "Amp inventory is being auctioned through Prebid",
    owners = group(Commercial),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true, // Has to be true so that switch is exposed to dotcom-rendering
  )

  val prebidUserSync: Switch = Switch(
    group = CommercialPrebid,
    name = "prebid-user-sync",
    description = "Enable bidders to sync their user data with iframe or image beacons",
    owners = group(Commercial),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true,
  )

  val PrebidPermutiveAudience = Switch(
    group = CommercialPrebid,
    name = "prebid-permutive-audience",
    description = "Enable Permutive’s Audience Connector to run with Prebid",
    owners = group(Commercial),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true,
  )

  val prebidSonobi: Switch = Switch(
    group = CommercialPrebid,
    name = "prebid-sonobi",
    description = "Include Sonobi adapter in Prebid auctions",
    owners = group(Commercial),
    safeState = On,
    sellByDate = never,
    exposeClientSide = true,
  )

  val prebidAppNexus: Switch = Switch(
    group = CommercialPrebid,
    name = "prebid-appnexus",
    description = "Include AppNexus adapter in Prebid auctions",
    owners = group(Commercial),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true,
  )

  val prebidAppNexusUKROW: Switch = Switch(
    group = CommercialPrebid,
    name = "prebid-appnexus-uk-row",
    description = "Include AppNexus adapter in Prebid auctions in UK/ROW",
    owners = group(Commercial),
    safeState = On,
    sellByDate = never,
    exposeClientSide = true,
  )

  val prebidAppNexusInvcode: Switch = Switch(
    group = CommercialPrebid,
    name = "prebid-appnexus-invcode",
    description = "Swap placementId for invCode in the bid params",
    owners = group(Commercial),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true,
  )

  val prebidIndexExchange: Switch = Switch(
    group = CommercialPrebid,
    name = "prebid-index-exchange",
    description = "Include Index Exchange adapter in Prebid auctions",
    owners = group(Commercial),
    safeState = On,
    sellByDate = never,
    exposeClientSide = true,
  )

  val prebidOpenx: Switch = Switch(
    group = CommercialPrebid,
    name = "prebid-openx",
    description = "Include OpenX adapter in Prebid auctions",
    owners = group(Commercial),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true,
  )

  val prebidOzone: Switch = Switch(
    group = CommercialPrebid,
    name = "prebid-ozone",
    description = "Include Ozone adapter direct in Prebid auctions",
    owners = group(Commercial),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true,
  )

  val prebidPubmatic: Switch = Switch(
    group = CommercialPrebid,
    name = "prebid-pubmatic",
    description = "Include Pubmatic adapter in Prebid auctions",
    owners = group(Commercial),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true,
  )

  val prebidTrustx: Switch = Switch(
    group = CommercialPrebid,
    name = "prebid-trustx",
    description = "Include TrustX adapter in Prebid auctions",
    owners = group(Commercial),
    safeState = On,
    sellByDate = never,
    exposeClientSide = true,
  )

  val prebidTripleLift: Switch = Switch(
    group = CommercialPrebid,
    name = "prebid-triplelift",
    description = "Include Triple Lift adapter in Prebid auctions",
    owners = group(Commercial),
    safeState = On,
    sellByDate = never,
    exposeClientSide = true,
  )

  val prebidImproveDigital: Switch = Switch(
    group = CommercialPrebid,
    name = "prebid-improve-digital",
    description = "Include Improve Digital adapter in Prebid auctions",
    owners = group(Commercial),
    safeState = On,
    sellByDate = never,
    exposeClientSide = true,
  )

  val prebidImproveDigitalSkins: Switch = Switch(
    group = CommercialPrebid,
    "prebid-improve-digital-skins",
    "Include Collective page skins via Improve Digital adapter in Prebid auctions",
    owners = Seq(Owner.withGithub("mxdvl")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true,
  )

  val prebidXaxis: Switch = Switch(
    group = CommercialPrebid,
    name = "prebid-xaxis",
    description = "Include Xaxis adapter in Prebid auctions",
    owners = group(Commercial),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true,
  )

  val prebidAdYouLike: Switch = Switch(
    group = CommercialPrebid,
    name = "prebid-ad-you-like",
    description = "Include AdYouLike adapter in Prebid auctions",
    owners = group(Commercial),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true,
  )

  val prebidCriteo: Switch = Switch(
    group = CommercialPrebid,
    name = "prebid-criteo",
    description = "Include Criteo adapter in Prebid auctions",
    owners = group(Commercial),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true,
  )

  val prebidSmart: Switch = Switch(
    group = CommercialPrebid,
    name = "prebid-smart",
    description = "Include the Smart AdServer adapter in Prebid auctions",
    owners = group(Commercial),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true,
  )

  val mobileStickyLeaderboard: Switch = Switch(
    group = Commercial,
    name = "mobile-sticky-leaderboard",
    description = "Include Mobile Sticky leaderboard banner",
    owners = group(Commercial),
    safeState = On,
    sellByDate = never,
    exposeClientSide = true,
  )

  val mobileStickyPrebid: Switch = Switch(
    group = CommercialPrebid,
    name = "mobile-sticky-prebid",
    description = "Include Mobile Sticky leaderboard banner in Prebid",
    owners = group(Commercial),
    safeState = On,
    sellByDate = never,
    exposeClientSide = true,
  )

  val sentinelLogger: Switch = Switch(
    group = Commercial,
    name = "sentinel-logger",
    description = "Send logs to BigQuery allowing devs to discover from which pages legacy code is run",
    owners = group(Commercial),
    safeState = On,
    sellByDate = never,
    exposeClientSide = true,
  )

  val fetchNonRefreshableLineItems: Switch = Switch(
    group = Commercial,
    name = "fetch-non-refreshable-line-items",
    description = "Lazily fetch non-refreshable line item ids from an endpoint",
    owners = group(Commercial),
    safeState = On,
    sellByDate = never,
    exposeClientSide = true,
  )

  val ampContentABTesting: Switch = Switch(
    group = Commercial,
    name = "amp-content-ab-testing",
    description = "Enable content based testing on AMP",
    owners = group(Commercial),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true,
  )

  val teadsCookieless: Switch = Switch(
    group = Commercial,
    name = "teads-cookieless",
    description = "Enable Teads cookieless tag",
    owners = group(Commercial),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true,
  )
}
