package conf.switches

import conf.switches.Expiry.never
import conf.switches.Owner.group
import conf.switches.SwitchGroup.{Commercial, CommercialHeaderBidding}

trait CommercialSwitchGroup {
  val LiveBlogTopSponsorshipSwitch = Switch(
    Commercial,
    "live-blog-top-sponsorship",
    "When on allows a sponsorship ad to be displayed on live blogs",
    owners = Seq(Owner.withEmail("commercial.dev@guardian.co.uk")),
    safeState = On,
    sellByDate = never,
    exposeClientSide = true,
    highImpact = false,
  )

  val ShouldLoadGoogleTagSwitch = Switch(
    Commercial,
    "should-load-googletag",
    "If this switch is OFF, the commercial bundle won't load the googletag script. This is intended for use as a failsafe, and will disable all forms of advertising that are managed via Google Ad Manager, including Prebid and A9.",
    owners = Seq(Owner.withEmail("commercial.dev@guardian.co.uk")),
    safeState = On,
    sellByDate = never,
    exposeClientSide = true,
    highImpact = true,
    impactShortMessage = Some("Critical for advertising!"),
    impactFullMessage = Some(
      "Warning: Requires director-level sign-off + notification of global commercial stakeholders. Disabling this switch will cost £160k/day in ad-revenue",
    ),
  )

  val ImrWorldwideSwitch = Switch(
    Commercial,
    "imr-worldwide",
    "Enable the IMR Worldwide audience segment tracking.",
    owners = Seq(Owner.withEmail("commercial.dev@guardian.co.uk")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true,
    highImpact = false,
  )

  val InizioSwitch = Switch(
    Commercial,
    "inizio",
    "Include the Inizio script on page so that creatives can show a survey.",
    owners = Seq(Owner.withEmail("commercial.dev@guardian.co.uk")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true,
    highImpact = false,
  )

  val PermutiveSwitch = Switch(
    Commercial,
    "permutive",
    "Enable Permutive library loading",
    owners = Seq(Owner.withEmail("commercial.dev@guardian.co.uk")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true,
    highImpact = false,
  )

  val RemarketingSwitch = Switch(
    Commercial,
    "remarketing",
    "Enable Remarketing tracking",
    owners = Seq(Owner.withEmail("commercial.dev@guardian.co.uk")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true,
    highImpact = false,
  )

  val ConfiantAdVerification: Switch = Switch(
    group = Commercial,
    name = "confiant-ad-verification",
    description = "Enable Confiant ad verification",
    owners = Seq(Owner.withEmail("commercial.dev@guardian.co.uk")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true,
    highImpact = false,
  )

  val CommercialMetricsSwitch: Switch = Switch(
    group = Commercial,
    name = "commercial-metrics",
    description = "Send commercial metric data to the lake via Fastly",
    owners = Seq(Owner.withEmail("commercial.dev@guardian.co.uk")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true,
    highImpact = false,
  )

  val ArticleEndSlotSwitch: Switch = Switch(
    group = Commercial,
    name = "article-end-slot",
    description =
      "Enable the article end slot, this appears when the contributions epic does not. Currently only Public Good is served in this slot in the US.",
    owners = Seq(Owner.withEmail("commercial.dev@guardian.co.uk")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true,
    highImpact = false,
  )

  val AdManagerJobsSwitch: Switch = Switch(
    group = Commercial,
    name = "ad-manager-jobs",
    description = "Use line items file from the ad manager jobs process instead of the legacy frontend process",
    owners = Seq(Owner.withEmail("commercial.dev@guardian.co.uk")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true,
    highImpact = false,
  )

  val DisableChildDirectedSwitch: Switch = Switch(
    group = Commercial,
    name = "disable-child-directed",
    description = "Disable child-directed treatment for ads",
    owners = Seq(Owner.withEmail("commercial.dev@guardian.co.uk")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true,
    highImpact = false,
  )

  val SentinelLoggerSwitch: Switch = Switch(
    group = Commercial,
    name = "sentinel-logger",
    description = "Send logs to BigQuery allowing devs to discover from which pages legacy code is run",
    owners = Seq(Owner.withEmail("commercial.dev@guardian.co.uk")),
    safeState = On,
    sellByDate = never,
    exposeClientSide = true,
    highImpact = false,
  )

  val OptOutAdvertisingSwitch: Switch = Switch(
    group = Commercial,
    name = "opt-out-advertising",
    description = "Enable Opt Out Advertising",
    owners = Seq(Owner.withEmail("commercial.dev@guardian.co.uk")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true,
    highImpact = false,
  )

  val IasSwitch: Switch = Switch(
    group = Commercial,
    name = "commercial-ias",
    description = "Enable IAS third party integration in Commercial code",
    owners = Seq(Owner.withEmail("commercial.dev@guardian.co.uk")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true,
    highImpact = false,
  )

  val TeadsCookielessSwitch: Switch = Switch(
    group = Commercial,
    name = "teads-cookieless",
    description = "Enable Teads cookieless in commercial",
    owners = Seq(Owner.withEmail("commercial.dev@guardian.co.uk")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true,
    highImpact = false,
  )

  val IpsosMoriSwitch: Switch = Switch(
    group = Commercial,
    name = "ipsos-mori",
    description = "Enable Ipsos Mori (market research partner) integration in commercial",
    owners = Seq(Owner.withEmail("commercial.dev@guardian.co.uk")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true,
    highImpact = false,
  )

  val ComscoreSwitch = Switch(
    group = Commercial,
    name = "comscore",
    description = "If this switch is on, then Comscore reporting is enabled",
    owners = Seq(Owner.withEmail("commercial.dev@guardian.co.uk")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true,
    highImpact = false,
  )
}

trait CommercialHeaderBiddingSwitchGroup {
  val A9HeaderBiddingSwitch: Switch = Switch(
    group = CommercialHeaderBidding,
    name = "a9-header-bidding",
    description = "Turn on A9 header bidding",
    owners = Seq(Owner.withEmail("commercial.dev@guardian.co.uk")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true,
    highImpact = true,
    impactShortMessage = Some("Required for Amazon A9 (TAM) header bidding"),
    impactFullMessage = Some("Warning: Disabling this switch will prevent Amazon A9 (TAM) from running"),
  )

  val PrebidHeaderBiddingSwitch: Switch = Switch(
    group = CommercialHeaderBidding,
    name = "prebid-header-bidding",
    description = "Turn on Prebid header bidding (takes priority over Sonobi)",
    owners = Seq(Owner.withEmail("commercial.dev@guardian.co.uk")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true,
    highImpact = false,
  )

  val PrebidAnalyticsSwitch: Switch = Switch(
    group = CommercialHeaderBidding,
    name = "prebid-analytics",
    description = "Gather analytics from Prebid auctions",
    owners = Seq(Owner.withEmail("commercial.dev@guardian.co.uk")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true,
    highImpact = false,
  )

  val PrebidUserSyncSwitch: Switch = Switch(
    group = CommercialHeaderBidding,
    name = "prebid-user-sync",
    description = "Enable bidders to sync their user data with iframe or image beacons",
    owners = Seq(Owner.withEmail("commercial.dev@guardian.co.uk")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true,
    highImpact = false,
  )

  val PrebidPermutiveAudienceSwitch = Switch(
    group = CommercialHeaderBidding,
    name = "prebid-permutive-audience",
    description = "Enable Permutive’s Audience Connector to run with Prebid",
    owners = Seq(Owner.withEmail("commercial.dev@guardian.co.uk")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true,
    highImpact = false,
  )

  val PrebidAppNexusSwitch: Switch = Switch(
    group = CommercialHeaderBidding,
    name = "prebid-appnexus",
    description = "Include AppNexus adapter in Prebid auctions",
    owners = Seq(Owner.withEmail("commercial.dev@guardian.co.uk")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true,
    highImpact = false,
  )

  val PrebidAppNexusUKROWSwitch: Switch = Switch(
    group = CommercialHeaderBidding,
    name = "prebid-appnexus-uk-row",
    description = "Include AppNexus adapter in Prebid auctions in UK/ROW",
    owners = Seq(Owner.withEmail("commercial.dev@guardian.co.uk")),
    safeState = On,
    sellByDate = never,
    exposeClientSide = true,
    highImpact = false,
  )

  val PrebidAppNexusInvcodeSwitch: Switch = Switch(
    group = CommercialHeaderBidding,
    name = "prebid-appnexus-invcode",
    description = "Swap placementId for invCode in the bid params",
    owners = Seq(Owner.withEmail("commercial.dev@guardian.co.uk")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true,
    highImpact = false,
  )

  val PrebidIndexExchangeSwitch: Switch = Switch(
    group = CommercialHeaderBidding,
    name = "prebid-index-exchange",
    description = "Include Index Exchange adapter in Prebid auctions",
    owners = Seq(Owner.withEmail("commercial.dev@guardian.co.uk")),
    safeState = On,
    sellByDate = never,
    exposeClientSide = true,
    highImpact = false,
  )

  val PrebidOpenxSwitch: Switch = Switch(
    group = CommercialHeaderBidding,
    name = "prebid-openx",
    description = "Include OpenX adapter in Prebid auctions",
    owners = Seq(Owner.withEmail("commercial.dev@guardian.co.uk")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true,
    highImpact = false,
  )

  val PrebidOzoneSwitch: Switch = Switch(
    group = CommercialHeaderBidding,
    name = "prebid-ozone",
    description = "Include Ozone adapter direct in Prebid auctions",
    owners = Seq(Owner.withEmail("commercial.dev@guardian.co.uk")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true,
    highImpact = false,
  )

  val PrebidPubmaticSwitch: Switch = Switch(
    group = CommercialHeaderBidding,
    name = "prebid-pubmatic",
    description = "Include Pubmatic adapter in Prebid auctions",
    owners = Seq(Owner.withEmail("commercial.dev@guardian.co.uk")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true,
    highImpact = false,
  )

  val PrebidTrustxSwitch: Switch = Switch(
    group = CommercialHeaderBidding,
    name = "prebid-trustx",
    description = "Include TrustX adapter in Prebid auctions",
    owners = Seq(Owner.withEmail("commercial.dev@guardian.co.uk")),
    safeState = On,
    sellByDate = never,
    exposeClientSide = true,
    highImpact = false,
  )

  val PrebidTripleLiftSwitch: Switch = Switch(
    group = CommercialHeaderBidding,
    name = "prebid-triplelift",
    description = "Include Triple Lift adapter in Prebid auctions",
    owners = Seq(Owner.withEmail("commercial.dev@guardian.co.uk")),
    safeState = On,
    sellByDate = never,
    exposeClientSide = true,
    highImpact = false,
  )

  val PrebidXaxisSwitch: Switch = Switch(
    group = CommercialHeaderBidding,
    name = "prebid-xaxis",
    description = "Include Xaxis adapter in Prebid auctions",
    owners = Seq(Owner.withEmail("commercial.dev@guardian.co.uk")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true,
    highImpact = false,
  )

  val PrebidCriteoSwitch: Switch = Switch(
    group = CommercialHeaderBidding,
    name = "prebid-criteo",
    description = "Include Criteo adapter in Prebid auctions",
    owners = Seq(Owner.withEmail("commercial.dev@guardian.co.uk")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true,
    highImpact = false,
  )

  val PrebidKargoSwitch: Switch = Switch(
    group = CommercialHeaderBidding,
    name = "prebid-kargo",
    description = "Include the Kargo adapter in Prebid auctions",
    owners = Seq(Owner.withEmail("commercial.dev@guardian.co.uk")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true,
    highImpact = false,
  )

  val PrebidTeadsSwitch: Switch = Switch(
    group = CommercialHeaderBidding,
    name = "prebid-teads",
    description = "Include the Teads adapter in Prebid auctions",
    owners = Seq(Owner.withEmail("commercial.dev@guardian.co.uk")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true,
    highImpact = false,
  )

  val PrebidLiverampSwitch: Switch = Switch(
    group = CommercialHeaderBidding,
    name = "prebid-liveramp",
    description = "When ON, the Liveramp ID integration is enabled for user sync in Prebid",
    owners = Seq(Owner.withEmail("commercial.dev@guardian.co.uk")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true,
    highImpact = false,
  )

  val PrebidMagniteSwitch: Switch = Switch(
    group = CommercialHeaderBidding,
    name = "prebid-magnite",
    description = "Include the Magnite adapter in Prebid auctions",
    owners = Seq(Owner.withEmail("commercial.dev@guardian.co.uk")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true,
    highImpact = false,
  )

  val PrebidTheTradeDeskSwitch: Switch = Switch(
    group = CommercialHeaderBidding,
    name = "prebid-the-trade-desk",
    description = "Include The Trade Desk (ttd) adapter in Prebid auctions",
    owners = Seq(Owner.withEmail("commercial.dev@guardian.co.uk")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true,
    highImpact = false,
  )
}

trait CommercialSwitches extends CommercialSwitchGroup with CommercialHeaderBiddingSwitchGroup
