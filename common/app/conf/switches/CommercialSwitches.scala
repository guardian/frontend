package conf.switches

import conf.switches.Expiry.never
import conf.switches.Owner.group
import conf.switches.SwitchGroup.{Commercial, CommercialPrebid}
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

  val OutbrainNewIdsSwitch = Switch(
    Commercial,
    "commercial-outbrain-newids",
    "Enable the Outbrain new IDs (Late Jan 2019)",
    owners = Seq(Owner.withGithub("jeteve")),
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

  val HostedVideoAutoplay = Switch(
    Commercial,
    "hosted-video-autoplay",
    "When ON, hosted video content may be allowed to autoplay",
    owners = Seq(Owner.withGithub("katebee")),
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

    val InizioSwitch = Switch(
    Commercial,
    "inizio",
    "Include the Inizio script on page so that creatives can show a survey.",
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

  val EpicTestsFromGoogleDocs = Switch(
    Commercial,
    "epic-tests-from-google-docs",
    "Fetches epic tests from Google Docs. These take priority over hardcoded epic tests.",
    owners = Seq(Owner.withGithub("joelochlann")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true
  )

  val EngagementBannerTestsFromGoogleDocs = Switch(
    Commercial,
    "engagement-banner-tests-from-google-docs",
    "Fetches engagement banner tests from Google Docs. These take priority over hardcoded banner tests.",
    owners = Seq(Owner.withGithub("joelochlann")),
    safeState = Off,
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

  val KruxVideoTracking = Switch(
    Commercial,
    "krux-video-tracking",
    "If this switch is ON, there will be a Krux pixel fired to track particular videos",
    owners = group(Commercial),
    safeState = On,
    sellByDate = never,
    exposeClientSide = true
  )

  val OrielAnalyticsSwitch: Switch = Switch(
    group = Commercial,
    name = "oriel-analytics-or-full",
    description = "Turn on to include the analytics ONLY for Oriel. Turn off to include the FULL integration script. Depends on AB test switch.",
    owners = group(Commercial),
    safeState = On,
    sellByDate = new LocalDate(2019, 2, 7),
    exposeClientSide = false
  )

  val BlockthroughSwitch: Switch = Switch(
    group = Commercial,
    name = "blockthrough",
    description = "Include the blockthrough script for testing the vendors effectiveness at circumventing ad-blocking.",
    owners = group(Commercial),
    safeState = Off,
    sellByDate = new LocalDate(2019, 2, 7),
    exposeClientSide = false
   )

   val LotameSwitch: Switch = Switch(
     group = Commercial,
     name = "lotame",
     description = "When this is switched on the Lotame script will be included in the commercial bootstrap",
     owners = group(Commercial),
     safeState = Off,
     sellByDate = never,
     exposeClientSide = true
   )

  val AffiliateLinks: Switch = Switch(
    group = Commercial,
    name = "affiliate-links",
    description = "Enable affiliate links. If off, affiliate links will never be added to content by frontend apps. If on, affiliate links may be added based off other settings",
    owners = group(Commercial),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = false
  )

  val AffiliateLinkSections: Switch = Switch(
    group = Commercial,
    name = "affiliate-links-sections",
    description = "Add affiliate links to all content in sections in affiliateLinkSections config property when no override exists in capi (showAffiliateLinks field).",
    owners = group(Commercial),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = false
  )

  val enableConsentManagementService: Switch = Switch(
    group = Commercial,
    name = "enable-consent-management-service",
    description = "Enable our CMP service to run on each page, so that vendors can query the consent status.",
    owners = group(Commercial),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true
  )

  val commercialPageViewAnalytics: Switch = Switch(
    group = Commercial,
    name = "commercial-page-view-analytics",
    description = "Gather commercial analytics from page views",
    owners = group(Commercial),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true
  )
}

trait PrebidSwitches {

  val prebidSwitch: Switch = Switch(
    group = CommercialPrebid,
    name = "prebid-header-bidding",
    description = "Turn on Prebid header bidding (takes priority over Sonobi)",
    owners = group(Commercial),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = false
  )

  val prebidAnalytics: Switch = Switch(
    group = CommercialPrebid,
    name = "prebid-analytics",
    description = "Gather analytics from Prebid auctions",
    owners = group(Commercial),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true
  )

  val ampPrebid: Switch = Switch(
    group = CommercialPrebid,
    name = "amp-prebid",
    description = "Amp inventory is being auctioned through Prebid",
    owners = group(Commercial),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = false
  )

  val prebidUserSync: Switch = Switch(
    group = CommercialPrebid,
    name = "prebid-user-sync",
    description = "Enable bidders to sync their user data with iframe or image beacons",
    owners = group(Commercial),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true
  )

  val prebidSonobi: Switch = Switch(
    group = CommercialPrebid,
    name = "prebid-sonobi",
    description = "Include Sonobi adapter in Prebid auctions",
    owners = group(Commercial),
    safeState = On,
    sellByDate = never,
    exposeClientSide = true
  )

  val prebidAppNexus: Switch = Switch(
    group = CommercialPrebid,
    name = "prebid-appnexus",
    description = "Include AppNexus adapter in Prebid auctions",
    owners = group(Commercial),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true
  )

  val prebidAppNexusUKROW: Switch = Switch(
    group = CommercialPrebid,
    name = "prebid-appnexus-uk-row",
    description = "Include AppNexus adapter in Prebid auctions in UK/ROW",
    owners = group(Commercial),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true
  )

  val prebidAppNexusInvcode: Switch = Switch(
    group = CommercialPrebid,
    name = "prebid-appnexus-invcode",
    description = "Swap placementId for invCode in the bid params",
    owners = group(Commercial),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true
  )

  val prebidIndexExchange: Switch = Switch(
    group = CommercialPrebid,
    name = "prebid-index-exchange",
    description = "Include Index Exchange adapter in Prebid auctions",
    owners = group(Commercial),
    safeState = On,
    sellByDate = never,
    exposeClientSide = true
  )

  val prebidOpenx: Switch = Switch(
    group = CommercialPrebid,
    name = "prebid-openx",
    description = "Include OpenX adapter in Prebid auctions",
    owners = group(Commercial),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true
  )

  val prebidPubmatic: Switch = Switch(
    group = CommercialPrebid,
    name = "prebid-pubmatic",
    description = "Include Pubmatic adapter in Prebid auctions",
    owners = group(Commercial),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true
  )

  val prebidTrustx: Switch = Switch(
    group = CommercialPrebid,
    name = "prebid-trustx",
    description = "Include TrustX adapter in Prebid auctions",
    owners = group(Commercial),
    safeState = On,
    sellByDate = never,
    exposeClientSide = true
  )

  val prebidImproveDigital: Switch = Switch(
    group = CommercialPrebid,
    name = "prebid-improve-digital",
    description = "Include Improve Digital adapter in Prebid auctions",
    owners = group(Commercial),
    safeState = On,
    sellByDate = never,
    exposeClientSide = true
  )

  val prebidXaxis: Switch = Switch(
    group = CommercialPrebid,
    name = "prebid-xaxis",
    description = "Include Xaxis adapter in Prebid auctions",
    owners = group(Commercial),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true
  )

  val prebidAdYouLike: Switch = Switch(
    group = CommercialPrebid,
    name = "prebid-ad-you-like",
    description = "Include AdYouLike adapter in Prebid auctions",
    owners = group(Commercial),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true
  )

  val prebidS2SOzoneBidder: Switch = Switch(
    group = CommercialPrebid,
    name = "prebid-s2sozone",
    description = "Include S2S Ozone project adapter in Prebid auctions",
    owners = group(Commercial),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true
  )
}
