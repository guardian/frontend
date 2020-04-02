package conf.switches

import conf.switches.Expiry.never
import conf.switches.Owner.group
import conf.switches.SwitchGroup.{Commercial, CommercialPrebid, Membership}
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

  val CmpUi = Switch(
    SwitchGroup.Feature,
    "cmp-ui",
    "If this switch is off, the CMP UI will be completely unavailable to users.",
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

  val TwitterUwtSwitch = Switch(
    Commercial,
    "twitter-uwt",
    "Include the Twitter universal website tag code.",
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

  val PermutiveSwitch = Switch(
    Commercial,
    "permutive",
    "Enable Permutive library loading",
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

  val UseConfiguredEpicTests = Switch(
    Commercial,
    "use-configured-epic-tests",
    "Fetches epic tests a file created by the Epic Test tool. These take priority over hardcoded epic tests.",
    owners = Seq(Owner.withGithub("tomrf1")),
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

  val SubscriptionBanner = Switch(
    Commercial,
    "subscription-banner",
    "if this is switched on the subscriptions banner will show (region visibility is controlled from the frontend banner code)",
    owners = group(Membership),
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

  val AdblockAsk = Switch(
    Commercial,
    "ab-adblock-ask",
    "Places a contributions ask underneath the right-hand ad slot on articles.",
    owners = group(Membership),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true
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

  val facebookTrackingPixel: Switch = Switch(
    group = Commercial,
    name = "facebook-tracking-pixel",
    description = "Facebook's PageView tracking to improve ad targeting",
    owners = group(Commercial),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true
  )

  val confiantAdVerification: Switch = Switch(
    group = Commercial,
    name = "confiant-ad-verification",
    description = "Enable Confiant ad verification",
    owners = group(Commercial),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true
  )

  val a9Switch: Switch = Switch(
    group = CommercialPrebid,
    name = "a9-header-bidding",
    description = "Turn on A9 header bidding",
    owners = group(Commercial),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = false
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
    exposeClientSide = true // Has to be true so that switch is exposed to dotcom-rendering
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

  val prebidOzone: Switch = Switch(
    group = CommercialPrebid,
    name = "prebid-ozone",
    description = "Include Ozone adapter direct in Prebid auctions",
    owners = group(Commercial),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true
  )

  val prebidPangaea: Switch = Switch(
    group = CommercialPrebid,
    name = "prebid-pangaea",
    description = "Include Pangaea adapter in Prebid auctions",
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

  val prebidTripleLift: Switch = Switch(
    group = CommercialPrebid,
    name = "prebid-triplelift",
    description = "Include Triple Lift adapter in Prebid auctions",
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

  val mobileStickyLeaderboard: Switch = Switch(
    group = Commercial,
    name = "mobile-sticky-leaderboard",
    description = "Include Mobile Sticky leaderboard banner",
    owners = group(Commercial),
    safeState = On,
    sellByDate = never,
    exposeClientSide = true
  )

  val mobileStickyPrebid: Switch = Switch(
    group = Commercial,
    name = "mobile-sticky-prebid",
    description = "Include Mobile Sticky leaderboard banner in Prebid",
    owners = group(Commercial),
    safeState = On,
    sellByDate = never,
    exposeClientSide = true
  )

  val pangaeaUsAuBidder: Switch = Switch(
    group = CommercialPrebid,
    name = "prebid-pangaea-us-au",
    description = "Include Pangaea adapter to US & AU regions",
    owners = group(Commercial),
    safeState = On,
    sellByDate = never,
    exposeClientSide = true
  )

  val ampOzone: Switch = Switch(
    group = CommercialPrebid,
    name = "amp-ozone",
    description = "Amp inventory is being auctioned through Ozone",
    owners = group(Commercial),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true // Has to be true so that switch is exposed to dotcom-rendering
  )
}
