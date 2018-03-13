package conf.switches

import conf.switches.Expiry.never
import conf.switches.Owner.group
import conf.switches.SwitchGroup.Commercial
import org.joda.time.LocalDate

trait CommercialSwitches {

  val CommercialSwitch = Switch(
    Commercial,
    "commercial",
    "If this switch is OFF, no calls will be made to the ad server. BEWARE!",
    owners = group(Commercial),
    safeState = On,
    sellByDate = never,
    exposeClientSide = true
  )

  val CarrotTrafficDriverSwitch = Switch(
    Commercial,
    "carrot-traffic-driver",
    "Enables the requesting and rendering of the carrot traffic driving component.",
    owners = Seq(Owner.withGithub("JonNorman")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true
  )

  val IasTargetingSwitch = Switch(
    Commercial,
    "ias-ad-targeting",
    "Enables the IAS slot-targeting optimisation.",
    owners = Seq(Owner.withGithub("JonNorman")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true
  )

  val SurveySwitch = Switch(
    Commercial,
    "surveys",
    "For delivering surveys, enables the requesting of the out-of-page slot on non-fronts",
    owners = Seq(Owner.withGithub("JonNorman")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true
  )

  val BlockIASSwitch = Switch(
    Commercial,
    "block-ias",
    "Controls whether the Service Worker can filter out IAS calls",
    owners = Seq(Owner.withGithub("regiskuckaertz")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true
  )

  val AdFreeTrialSwitch = Switch(
    Commercial,
    "ad-free-subscription-trial",
    "Master switch for trialling ad-free subscription",
    owners = Seq(Owner.withGithub("JustinPinner")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true
  )

  val AdFreeStrictExpiryEnforcement = Switch(
    Commercial,
    "ad-free-strict-expiry-enforcement",
    "When ON, the ad-free cookie is valid for max. 48 hours. OFF doesn't enforce expiry check.",
    owners = Seq(Owner.withGithub("JustinPinner")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true
  )

  val TourismAustraliaSwitch = Switch(
    Commercial,
    "tourism-australia",
    "If this switch is on, the Tourism Australia pixel is added to the Ashes Australia travel section.",
    owners = group(Commercial),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true
  )

  val ImrWorldwideSwitch = Switch(
    Commercial,
    "imr-worldwide",
    "Enable the IMR Worldwide audience segment tracking.",
    owners = group(Commercial),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true
  )

  val AdomikSwitch = Switch(
    Commercial,
    "adomik",
    "Enable Adomik traffic splitting.",
    owners = group(Commercial),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true
  )

  val KruxSwitch = Switch(
    Commercial,
    "krux",
    "Enable Krux Control Tag",
    owners = group(Commercial),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true
  )

  val DoubleClickYouTubeAdFree = Switch(
    Commercial,
    "doubleclick-youtube-ad-free",
    "Enable DoubleClick Segment for YouTube for Ad Free Users",
    owners = group(Commercial),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true
  )

  val RemarketingSwitch = Switch(
    Commercial,
    "remarketing",
    "Enable Remarketing tracking",
    owners = group(Commercial),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true
  )

  val SimpleReachSwitch = Switch(
    Commercial,
    "simple-reach",
    "Enable Simple Reach tracking and reporting.",
    owners = group(Commercial),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true
  )

  val TravelFeedFetchSwitch = Switch(
    SwitchGroup.CommercialFeeds,
    "gu-travel-feed-fetch",
    "If this switch is on, cached travel offers feed will be updated from external source.",
    owners = group(Commercial),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = false
  )

  val TravelFeedParseSwitch = Switch(
    SwitchGroup.CommercialFeeds,
    "gu-travel-feed-parse",
    "If this switch is on, commercial components will be fed by travel offers feed.",
    owners = group(Commercial),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = false
  )

  val JobsFeedFetchSwitch = Switch(
    SwitchGroup.CommercialFeeds,
    "gu-jobs-feed-fetch",
    "If this switch is on, jobs feed will be periodically updated from external source.",
    owners = Owner.group(SwitchGroup.Commercial),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = false
  )

  val JobsFeedParseSwitch = Switch(
    SwitchGroup.CommercialFeeds,
    "gu-jobs-feed-parse",
    "If this switch is on, commercial components will be fed by jobs feed.",
    owners = Owner.group(SwitchGroup.Commercial),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = false
  )

  val EventsFeedSwitch = Switch(
    SwitchGroup.CommercialFeeds,
    "gu-events",
    "If this switch is on, commercial components will be fed by masterclass and live-events feeds.",
    owners = group(Commercial),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = false
  )

  val SoulmatesFeedSwitch = Switch(
    SwitchGroup.CommercialFeeds,
    "gu-soulmates",
    "If this switch is on, commercial components will be fed by soulmates feed.",
    owners = group(Commercial),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = false
  )

  val GuBookshopFeedsSwitch = Switch(
    SwitchGroup.CommercialFeeds,
    "gu-bookshop",
    "If this switch is on, commercial components will be fed by the Guardian Bookshop feed.",
    owners = group(Commercial),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = false
  )

  val BookLookupSwitch = Switch(
    SwitchGroup.CommercialFeeds,
    "book-lookup",
    "If this switch is on, book data will be looked up using a third-party service.",
    owners = group(Commercial),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = false
  )

  val MembershipEngagementBanner = Switch(
    Commercial,
    "membership-engagement-banner",
    "Master switch for the membership engagement banner.",
    owners = Seq(Owner.withGithub("justinpinner")),
    safeState = On,
    sellByDate = never,
    exposeClientSide = true
  )

  val MembershipEngagementBannerBlockUK = Switch(
    Commercial,
    "membership-engagement-banner-block-uk",
    "If this switch is turned on, the engagement banner will NOT show up on UK fronts for readers in the UK",
    owners = Seq(Owner.withGithub("desbo")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true
  )

  val MembershipEngagementBannerBlockUS = Switch(
    Commercial,
    "membership-engagement-banner-block-us",
    "If this switch is turned on, the engagement banner will NOT show up on US fronts for readers in the US",
    owners = Seq(Owner.withGithub("desbo")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true
  )

  val MembershipEngagementBannerBlockAU = Switch(
    Commercial,
    "membership-engagement-banner-block-au",
    "If this switch is turned on, the engagement banner will NOT show up on AU fronts for readers in AU",
    owners = Seq(Owner.withGithub("desbo")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true
  )

  val AdBlockMessage = Switch(
    Commercial,
    "adblock",
    "Switch for the Adblock Message.",
    owners = group(Commercial),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true
  )

  val KruxVideoTracking = Switch(
    Commercial,
    "krux-video-tracking",
    "If this switch is ON, there will be a Krux pixel fired to track particular videos",
    owners = group(Commercial),
    safeState = On,
    sellByDate = never,
    exposeClientSide = true
  )

  val sonobiSwitch: Switch = Switch(
    group = Commercial,
    name = "sonobi-header-bidding",
    description = "Turn on Sonobi header bidding",
    owners = Owner.group(SwitchGroup.Commercial),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = false
  )

  val OrielAnalyticsSwitch: Switch = Switch(
    group = Commercial,
    name = "oriel-analytics-or-full",
    description = "Turn on to include the analytics ONLY for Oriel. Turn off to include the FULL integration script. Depends on AB test switch.",
    owners = group(Commercial),
    safeState = On,
    sellByDate = new LocalDate(2018, 6, 28),
    exposeClientSide = false
  )

  val BlockthroughSwitch: Switch = Switch(
    group = Commercial,
    name = "blockthrough",
    description = "Include the blockthrough script for testing the vendors effectiveness at circumventing ad-blocking.",
    owners = group(Commercial),
    safeState = Off,
    sellByDate = new LocalDate(2018, 4, 17),
    exposeClientSide = false
   )

  val prebidSwitch: Switch = Switch(
    group = Commercial,
    name = "prebid-header-bidding",
    description = "Turn on Prebid header bidding (takes priority over Sonobi)",
    owners = group(Commercial),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = false
  )

  val prebidAnalytics: Switch = Switch(
    group = Commercial,
    name = "prebid-analytics",
    description = "Gather analytics from Prebid auctions",
    owners = group(Commercial),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true
  )

  val prebidSonobi: Switch = Switch(
    group = Commercial,
    name = "prebid-sonobi",
    description = "Include Sonobi adapter in Prebid auctions",
    owners = group(Commercial),
    safeState = On,
    sellByDate = never,
    exposeClientSide = true
  )

  val prebidIndexExchange: Switch = Switch(
    group = Commercial,
    name = "prebid-index-exchange",
    description = "Include Index Exchange adapter in Prebid auctions",
    owners = group(Commercial),
    safeState = On,
    sellByDate = never,
    exposeClientSide = true
  )

  val prebidTrustx: Switch = Switch(
    group = Commercial,
    name = "prebid-trustx",
    description = "Include TrustX adapter in Prebid auctions",
    owners = group(Commercial),
    safeState = On,
    sellByDate = never,
    exposeClientSide = true
  )

  val prebidImproveDigital: Switch = Switch(
    group = Commercial,
    name = "prebid-improve-digital",
    description = "Include Improve Digital adapter in Prebid auctions",
    owners = group(Commercial),
    safeState = On,
    sellByDate = never,
    exposeClientSide = true
  )

  val prebidXaxis: Switch = Switch(
    group = Commercial,
    name = "prebid-xaxis",
    description = "Include Xaxis adapter in Prebid auctions",
    owners = group(Commercial),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true
  )

  val orielSonobiIntegration: Switch = Switch(
    group = Commercial,
    name = "oriel-sonobi-integration-test",
    description = "This is a short test to test the integration between Oriel and Sonobi",
    owners = group(Commercial),
    safeState = Off,
    sellByDate = new LocalDate(2018, 6, 28),
    exposeClientSide = false
  )

  val ReplaceSkimLinks: Switch = Switch(
    group = Commercial,
    name = "replace-skimlinks",
    description = "For content in certain sections, replace body links supported by skimlinks.com with a skimlink url",
    owners = group(Commercial),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = false
  )
}
