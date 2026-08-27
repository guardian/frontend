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

  val confiantAdVerification: Switch = Switch(
    group = Commercial,
    name = "confiant-ad-verification",
    description = "Enable Confiant ad verification",
    owners = Seq(Owner.withEmail("commercial.dev@guardian.co.uk")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true,
    highImpact = false,
  )

  val commercialMetrics: Switch = Switch(
    group = Commercial,
    name = "commercial-metrics",
    description = "Send commercial metric data to the lake via Fastly",
    owners = Seq(Owner.withEmail("commercial.dev@guardian.co.uk")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true,
    highImpact = false,
  )

  val articleEndSlot: Switch = Switch(
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

  val AdManagerJobs: Switch = Switch(
    group = Commercial,
    name = "ad-manager-jobs",
    description = "Use line items file from the ad manager jobs process instead of the legacy frontend process",
    owners = Seq(Owner.withEmail("commercial.dev@guardian.co.uk")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true,
    highImpact = false,
  )

  val disableChildDirected: Switch = Switch(
    group = Commercial,
    name = "disable-child-directed",
    description = "Disable child-directed treatment for ads",
    owners = Seq(Owner.withEmail("commercial.dev@guardian.co.uk")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true,
    highImpact = false,
  )

  val sentinelLogger: Switch = Switch(
    group = Commercial,
    name = "sentinel-logger",
    description = "Send logs to BigQuery allowing devs to discover from which pages legacy code is run",
    owners = Seq(Owner.withEmail("commercial.dev@guardian.co.uk")),
    safeState = On,
    sellByDate = never,
    exposeClientSide = true,
    highImpact = false,
  )

  val optOutAdvertising: Switch = Switch(
    group = Commercial,
    name = "opt-out-advertising",
    description = "Enable Opt Out Advertising",
    owners = Seq(Owner.withEmail("commercial.dev@guardian.co.uk")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true,
    highImpact = false,
  )

  val ias: Switch = Switch(
    group = Commercial,
    name = "commercial-ias",
    description = "Enable IAS third party integration in Commercial code",
    owners = Seq(Owner.withEmail("commercial.dev@guardian.co.uk")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true,
    highImpact = false,
  )

  val teadsCookieless: Switch = Switch(
    group = Commercial,
    name = "teads-cookieless",
    description = "Enable Teads cookieless in commercial",
    owners = Seq(Owner.withEmail("commercial.dev@guardian.co.uk")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true,
    highImpact = false,
  )

  val ipsosMori: Switch = Switch(
    group = Commercial,
    name = "ipsos-mori",
    description = "Enable Ipsos Mori (market research partner) integration in commercial",
    owners = Seq(Owner.withEmail("commercial.dev@guardian.co.uk")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true,
    highImpact = false,
  )
}

trait CommercialHeaderBiddingSwitchGroup {
  val a9HeaderBidding: Switch = Switch(
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

  val prebidHeaderBidding: Switch = Switch(
    group = CommercialHeaderBidding,
    name = "prebid-header-bidding",
    description = "Turn on Prebid header bidding (takes priority over Sonobi)",
    owners = Seq(Owner.withEmail("commercial.dev@guardian.co.uk")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true,
    highImpact = false,
  )

  val prebidAnalytics: Switch = Switch(
    group = CommercialHeaderBidding,
    name = "prebid-analytics",
    description = "Gather analytics from Prebid auctions",
    owners = Seq(Owner.withEmail("commercial.dev@guardian.co.uk")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true,
    highImpact = false,
  )

  val prebidUserSync: Switch = Switch(
    group = CommercialHeaderBidding,
    name = "prebid-user-sync",
    description = "Enable bidders to sync their user data with iframe or image beacons",
    owners = Seq(Owner.withEmail("commercial.dev@guardian.co.uk")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true,
    highImpact = false,
  )

  val PrebidPermutiveAudience = Switch(
    group = CommercialHeaderBidding,
    name = "prebid-permutive-audience",
    description = "Enable Permutive’s Audience Connector to run with Prebid",
    owners = Seq(Owner.withEmail("commercial.dev@guardian.co.uk")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true,
    highImpact = false,
  )

  val prebidAppNexus: Switch = Switch(
    group = CommercialHeaderBidding,
    name = "prebid-appnexus",
    description = "Include AppNexus adapter in Prebid auctions",
    owners = Seq(Owner.withEmail("commercial.dev@guardian.co.uk")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true,
    highImpact = false,
  )

  val prebidAppNexusUKROW: Switch = Switch(
    group = CommercialHeaderBidding,
    name = "prebid-appnexus-uk-row",
    description = "Include AppNexus adapter in Prebid auctions in UK/ROW",
    owners = Seq(Owner.withEmail("commercial.dev@guardian.co.uk")),
    safeState = On,
    sellByDate = never,
    exposeClientSide = true,
    highImpact = false,
  )

  val prebidAppNexusInvcode: Switch = Switch(
    group = CommercialHeaderBidding,
    name = "prebid-appnexus-invcode",
    description = "Swap placementId for invCode in the bid params",
    owners = Seq(Owner.withEmail("commercial.dev@guardian.co.uk")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true,
    highImpact = false,
  )

  val prebidIndexExchange: Switch = Switch(
    group = CommercialHeaderBidding,
    name = "prebid-index-exchange",
    description = "Include Index Exchange adapter in Prebid auctions",
    owners = Seq(Owner.withEmail("commercial.dev@guardian.co.uk")),
    safeState = On,
    sellByDate = never,
    exposeClientSide = true,
    highImpact = false,
  )

  val prebidOpenx: Switch = Switch(
    group = CommercialHeaderBidding,
    name = "prebid-openx",
    description = "Include OpenX adapter in Prebid auctions",
    owners = Seq(Owner.withEmail("commercial.dev@guardian.co.uk")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true,
    highImpact = false,
  )

  val prebidOzone: Switch = Switch(
    group = CommercialHeaderBidding,
    name = "prebid-ozone",
    description = "Include Ozone adapter direct in Prebid auctions",
    owners = Seq(Owner.withEmail("commercial.dev@guardian.co.uk")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true,
    highImpact = false,
  )

  val prebidPubmatic: Switch = Switch(
    group = CommercialHeaderBidding,
    name = "prebid-pubmatic",
    description = "Include Pubmatic adapter in Prebid auctions",
    owners = Seq(Owner.withEmail("commercial.dev@guardian.co.uk")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true,
    highImpact = false,
  )

  val prebidTrustx: Switch = Switch(
    group = CommercialHeaderBidding,
    name = "prebid-trustx",
    description = "Include TrustX adapter in Prebid auctions",
    owners = Seq(Owner.withEmail("commercial.dev@guardian.co.uk")),
    safeState = On,
    sellByDate = never,
    exposeClientSide = true,
    highImpact = false,
  )

  val prebidTripleLift: Switch = Switch(
    group = CommercialHeaderBidding,
    name = "prebid-triplelift",
    description = "Include Triple Lift adapter in Prebid auctions",
    owners = Seq(Owner.withEmail("commercial.dev@guardian.co.uk")),
    safeState = On,
    sellByDate = never,
    exposeClientSide = true,
    highImpact = false,
  )

  val prebidXaxis: Switch = Switch(
    group = CommercialHeaderBidding,
    name = "prebid-xaxis",
    description = "Include Xaxis adapter in Prebid auctions",
    owners = Seq(Owner.withEmail("commercial.dev@guardian.co.uk")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true,
    highImpact = false,
  )

  val prebidCriteo: Switch = Switch(
    group = CommercialHeaderBidding,
    name = "prebid-criteo",
    description = "Include Criteo adapter in Prebid auctions",
    owners = Seq(Owner.withEmail("commercial.dev@guardian.co.uk")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true,
    highImpact = false,
  )

  val prebidKargo: Switch = Switch(
    group = CommercialHeaderBidding,
    name = "prebid-kargo",
    description = "Include the Kargo adapter in Prebid auctions",
    owners = Seq(Owner.withEmail("commercial.dev@guardian.co.uk")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true,
    highImpact = false,
  )

  val prebidTeads: Switch = Switch(
    group = CommercialHeaderBidding,
    name = "prebid-teads",
    description = "Include the Teads adapter in Prebid auctions",
    owners = Seq(Owner.withEmail("commercial.dev@guardian.co.uk")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true,
    highImpact = false,
  )

  val prebidLiveramp: Switch = Switch(
    group = CommercialHeaderBidding,
    name = "prebid-liveramp",
    description = "When ON, the Liveramp ID integration is enabled for user sync in Prebid",
    owners = Seq(Owner.withEmail("commercial.dev@guardian.co.uk")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true,
    highImpact = false,
  )

  val prebidMagnite: Switch = Switch(
    group = CommercialHeaderBidding,
    name = "prebid-magnite",
    description = "Include the Magnite adapter in Prebid auctions",
    owners = Seq(Owner.withEmail("commercial.dev@guardian.co.uk")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true,
    highImpact = false,
  )

  val prebidTheTradeDesk: Switch = Switch(
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
