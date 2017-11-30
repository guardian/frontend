package conf.switches

import conf.switches.Expiry.never
import org.joda.time.LocalDate

trait CommercialSwitches {

  val CommercialSwitch = Switch(
    SwitchGroup.Commercial,
    "commercial",
    "If this switch is OFF, no calls will be made to the ad server. BEWARE!",
    owners = Seq(Owner.withName("commercial team")),
    safeState = On,
    sellByDate = never,
    exposeClientSide = true
  )

  val VideoSlotsSwitch = Switch(
    SwitchGroup.Commercial,
    "keep-video-ad-slots-open",
    "Deactivates the sizecallback for videos (620x1) that hides the slot.",
    owners = Seq(Owner.withGithub("JonNorman")),
    safeState = Off,
    sellByDate = new LocalDate(2017, 12, 13),
    exposeClientSide = true
  )

  Switch(
    SwitchGroup.Commercial,
    "ias-ad-targeting",
    "Enables the IAS slot-targeting optimisation.",
    owners = Seq(Owner.withGithub("JonNorman")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true
  )

  val SurveySwitch = Switch(
    SwitchGroup.Commercial,
    "surveys",
    "For delivering surveys, enables the requesting of the out-of-page slot on non-fronts",
    owners = Seq(Owner.withGithub("JonNorman")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true
  )

  val BlockIASSwitch = Switch(
    SwitchGroup.Commercial,
    "block-ias",
    "Controls whether the Service Worker can filter out IAS calls",
    owners = Seq(Owner.withGithub("regiskuckaertz")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true
  )

  val AdFreeTrialSwitch = Switch(
    SwitchGroup.Commercial,
    "ad-free-subscription-trial",
    "Master switch for trialling ad-free subscription",
    owners = Seq(Owner.withGithub("JustinPinner")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true
  )

  val AdFreeStrictExpiryEnforcement = Switch(
    SwitchGroup.Commercial,
    "ad-free-strict-expiry-enforcement",
    "When ON, the ad-free cookie is valid for max. 48 hours. OFF doesn't enforce expiry check.",
    owners = Seq(Owner.withGithub("JustinPinner")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true
  )

  val TourismAustraliaSwitch = Switch(
    SwitchGroup.Commercial,
    "tourism-australia",
    "If this switch is on, the Tourism Australia pixel is added to the Ashes Australia travel section.",
    owners = Seq(Owner.withName("commercial team")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true
  )

  val ImrWorldwideSwitch = Switch(
    SwitchGroup.Commercial,
    "imr-worldwide",
    "Enable the IMR Worldwide audience segment tracking.",
    owners = Seq(Owner.withName("commercial team")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true
  )

  val AdomikSwitch = Switch(
    SwitchGroup.Commercial,
    "adomik",
    "Enable Adomik traffic splitting.",
    owners = Seq(Owner.withName("commercial team")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true
  )

  val KruxSwitch = Switch(
    SwitchGroup.Commercial,
    "krux",
    "Enable Krux Control Tag",
    owners = Seq(Owner.withName("commercial team")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true
  )

  val DoubleClickYouTubeAdFree = Switch(
    SwitchGroup.Commercial,
    "doubleclick-youtube-ad-free",
    "Enable DoubleClick Segment for YouTube for Ad Free Users",
    owners = Seq(Owner.withName("commercial team")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true
  )

  val RemarketingSwitch = Switch(
    SwitchGroup.Commercial,
    "remarketing",
    "Enable Remarketing tracking",
    owners = Seq(Owner.withName("commercial team")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true
  )

  val SimpleReachSwitch = Switch(
    SwitchGroup.Commercial,
    "simple-reach",
    "Enable Simple Reach tracking and reporting.",
    owners = Seq(Owner.withName("commercial team")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true
  )

  val TravelFeedFetchSwitch = Switch(
    SwitchGroup.CommercialFeeds,
    "gu-travel-feed-fetch",
    "If this switch is on, cached travel offers feed will be updated from external source.",
    owners = Seq(Owner.withGithub("kelvin-chappell")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = false
  )

  val TravelFeedParseSwitch = Switch(
    SwitchGroup.CommercialFeeds,
    "gu-travel-feed-parse",
    "If this switch is on, commercial components will be fed by travel offers feed.",
    owners = Seq(Owner.withGithub("kelvin-chappell")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = false
  )

  val JobsFeedFetchSwitch = Switch(
    SwitchGroup.CommercialFeeds,
    "gu-jobs-feed-fetch",
    "If this switch is on, jobs feed will be periodically updated from external source.",
    owners = Seq(Owner.withGithub("rich-nguyen")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = false
  )

  val JobsFeedParseSwitch = Switch(
    SwitchGroup.CommercialFeeds,
    "gu-jobs-feed-parse",
    "If this switch is on, commercial components will be fed by jobs feed.",
    owners = Seq(Owner.withGithub("rich-nguyen")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = false
  )

  val EventsFeedSwitch = Switch(
    SwitchGroup.CommercialFeeds,
    "gu-events",
    "If this switch is on, commercial components will be fed by masterclass and live-events feeds.",
    owners = Seq(Owner.withName("commercial team")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = false
  )

  val SoulmatesFeedSwitch = Switch(
    SwitchGroup.CommercialFeeds,
    "gu-soulmates",
    "If this switch is on, commercial components will be fed by soulmates feed.",
    owners = Seq(Owner.withName("commercial team")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = false
  )

  val GuBookshopFeedsSwitch = Switch(
    SwitchGroup.CommercialFeeds,
    "gu-bookshop",
    "If this switch is on, commercial components will be fed by the Guardian Bookshop feed.",
    owners = Seq(Owner.withName("commercial team")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = false
  )

  val BookLookupSwitch = Switch(
    SwitchGroup.CommercialFeeds,
    "book-lookup",
    "If this switch is on, book data will be looked up using a third-party service.",
    owners = Seq(Owner.withName("commercial team")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = false
  )

  val MembershipEngagementBanner = Switch(
    SwitchGroup.Commercial,
    "membership-engagement-banner",
    "Master switch for the membership engagement banner.",
    owners = Seq(Owner.withGithub("justinpinner")),
    safeState = On,
    sellByDate = never,
    exposeClientSide = true
  )

  val MembershipEngagementBannerBlockUK = Switch(
    SwitchGroup.Commercial,
    "membership-engagement-banner-block-uk",
    "If this switch is turned on, the engagement banner will NOT show up on UK fronts for readers in the UK",
    owners = Seq(Owner.withGithub("desbo")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true
  )

  val MembershipEngagementBannerBlockUS = Switch(
    SwitchGroup.Commercial,
    "membership-engagement-banner-block-us",
    "If this switch is turned on, the engagement banner will NOT show up on US fronts for readers in the US",
    owners = Seq(Owner.withGithub("desbo")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true
  )

  val MembershipEngagementBannerBlockAU = Switch(
    SwitchGroup.Commercial,
    "membership-engagement-banner-block-au",
    "If this switch is turned on, the engagement banner will NOT show up on AU fronts for readers in AU",
    owners = Seq(Owner.withGithub("desbo")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true
  )

  val AdBlockMessage = Switch(
    SwitchGroup.Commercial,
    "adblock",
    "Switch for the Adblock Message.",
    owners = Seq(Owner.withName("commercial team")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true
  )

  val KruxVideoTracking = Switch(
    SwitchGroup.Commercial,
    "krux-video-tracking",
    "If this switch is ON, there will be a Krux pixel fired to track particular videos",
    owners = Seq(Owner.withGithub("commercial team")),
    safeState = On,
    sellByDate = never,
    exposeClientSide = true
  )

  val sonobiSwitch: Switch = Switch(
    group = SwitchGroup.Commercial,
    name = "sonobi-header-bidding",
    description = "Turn on Sonobi header bidding",
    owners = Seq(Owner.withGithub("rich-nguyen"), Owner.withGithub("janua")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true
  )

  val sponsoredPremierLeagueTable = Switch(
    group = SwitchGroup.Commercial,
    name = "sponsored-premier-league-table",
    description = "Show a hardcoded sponsor's logo on Premier League table page.",
    owners = Owner.group(SwitchGroup.Commercial),
    safeState = Off,
    sellByDate = new LocalDate(2018, 1, 3),
    exposeClientSide = false
  )
}
