package conf.switches

import conf.switches.Expiry.never
import conf.switches.SwitchGroup.CommercialLabs
import org.joda.time.LocalDate

trait CommercialSwitches {

  val DfpCachingSwitch = Switch(
    SwitchGroup.Commercial,
    "dfp-caching",
    "Have Admin will poll DFP to precache adserving data.",
    owners = Seq(Owner.withName("commercial team")),
    safeState = On,
    sellByDate = never,
    exposeClientSide = false
  )

  val HeaderBiddingUS = Switch(
    SwitchGroup.Commercial,
    "header-bidding-us",
    "Auction adverts on the client before calling DFP (US edition only)",
    owners = Seq(Owner.withGithub("regiskuckaertz ")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true
  )

  val CommercialSwitch = Switch(
    SwitchGroup.Commercial,
    "commercial",
    "If this switch is OFF, no calls will be made to the ad server. BEWARE!",
    owners = Seq(Owner.withName("commercial team")),
    safeState = On,
    sellByDate = never,
    exposeClientSide = true
  )

  val StandardAdvertsSwitch = Switch(
    SwitchGroup.Commercial,
    "standard-adverts",
    "Display 'standard' adverts, e.g. top banner ads, inline ads, MPUs, etc.",
    owners = Seq(Owner.withName("commercial team")),
    safeState = On,
    sellByDate = never,
    exposeClientSide = true
  )

  val CommercialComponentsSwitch = Switch(
    SwitchGroup.Commercial,
    "commercial-components",
    "Display commercial components, e.g. jobs, soulmates.",
    owners = Seq(Owner.withName("commercial team")),
    safeState = On,
    sellByDate = never,
    exposeClientSide = true
  )

  val VideoAdvertsSwitch = Switch(
    SwitchGroup.Commercial,
    "video-adverts",
    "Show adverts on videos.",
    owners = Seq(Owner.withName("commercial team")),
    safeState = On,
    sellByDate = never,
    exposeClientSide = true
  )

  val LiveblogAdvertsSwitch = Switch(
    SwitchGroup.Commercial,
    "liveblog-adverts",
    "Show inline adverts on liveblogs",
    owners = Seq(Owner.withName("commercial team")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true
  )

  val AudienceScienceGatewaySwitch = Switch(
    SwitchGroup.Commercial,
    "audience-science-gateway",
    "If this switch is on, Audience Science Gateway segments will be used to target ads.",
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

  val KruxSwitch = Switch(
    SwitchGroup.Commercial,
    "krux",
    "Enable Krux Control Tag",
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

  val MembersAreaSwitch = Switch(
    SwitchGroup.Commercial,
    "gu-members-area",
    "If this switch is on, content flagged with membershipAccess will be protected",
    owners = Seq(Owner.withGithub("JonNorman")),
    safeState = On,
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

  val BritishCouncilBeacon = Switch(
    SwitchGroup.Commercial,
    "british-council-beacon",
    "British Council's beacon",
    owners = Seq(Owner.withGithub("kenlim")),
    safeState = Off,
    sellByDate = new LocalDate(2016, 11, 1),
    exposeClientSide = false
  )

  val SponsoredSwitch = Switch(
    group = CommercialLabs,
    "sponsored",
    "Show sponsored badges, logos, etc.",
    owners = Seq(Owner.withName("commercial team")),
    safeState = On,
    sellByDate = never,
    exposeClientSide = true
  )

  val showChesterZooGallery = Switch(
    group = CommercialLabs,
    "chester-zoo-gallery",
    "Make the Chester Zoo gallery page available",
    owners = Owner.group(CommercialLabs),
    safeState = Off,
    sellByDate = new LocalDate(2016, 10, 28),
    exposeClientSide = false
  )

  val showChesterZooArticles = Switch(
    group = CommercialLabs,
    "chester-zoo-articles",
    "Make the Chester Zoo article pages available",
    owners = Owner.group(CommercialLabs),
    safeState = Off,
    sellByDate = new LocalDate(2016, 10, 28),
    exposeClientSide = false
  )

  val showChesterZooArticlesWithVideo = Switch(
    group = CommercialLabs,
    "chester-zoo-articles-with-video",
    "Make the Chester Zoo article (with video) pages available",
    owners = Owner.group(CommercialLabs),
    safeState = Off,
    sellByDate = new LocalDate(2016, 10, 28),
    exposeClientSide = false
  )

  val showChesterZooVideos = Switch(
    group = CommercialLabs,
    "chester-zoo-videos",
    "Make the Chester Zoo video pages available",
    owners = Owner.group(CommercialLabs),
    safeState = Off,
    sellByDate = new LocalDate(2016, 10, 28),
    exposeClientSide = false
  )

}
