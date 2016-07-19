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

  val AudienceScienceSwitch = Switch(
    SwitchGroup.Commercial,
    "audience-science",
    "If this switch is on, Audience Science segments will be used to target ads.",
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
    sellByDate = new LocalDate(2016, 8, 1),
    exposeClientSide = false
  )

  val FixedTechTopSlot = Switch(
    SwitchGroup.Commercial,
    "fixed-tech-top-slot",
    "Height of the top banner is fixed at 250px in the Tech section",
    owners = Seq(Owner.withGithub("regiskuckaertz")),
    safeState = Off,
    sellByDate = new LocalDate(2016, 7, 29),
    exposeClientSide = false
  )

  val highMerchandisingComponentSwitch = Switch(
    SwitchGroup.Commercial,
    "optimise-high-merchandising",
    "If on, server will check tags for high-merchandising target before rendering high-merch slot.",
    owners = Seq(Owner.withGithub("Calum Campbell")),
    safeState = Off,
    sellByDate = new LocalDate(2016,10,12),
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

  val staticBadgesSwitch = Switch(
    group = CommercialLabs,
    "static-badges",
    "If on, all badges are served server side",
    owners = Owner.group(CommercialLabs),
    safeState = Off,
    sellByDate = new LocalDate(2016, 8, 10),
    exposeClientSide = true
  )

  val containerBrandingFromCapi = Switch(
    group = CommercialLabs,
    "static-container-badges",
    "Serve container branding from capi",
    owners = Owner.group(CommercialLabs),
    safeState = Off,
    sellByDate = new LocalDate(2016, 8, 10),
    exposeClientSide = true
  )

  val showPaidSeriesContainer = Switch(
    group = CommercialLabs,
    "show-paid-series-containers",
    "Show series containers on paid content pages.",
    owners = Owner.group(CommercialLabs),
    safeState = Off,
    sellByDate = new LocalDate(2016, 8, 10),
    exposeClientSide = false
  )

  val hostedGalleryTest = Switch(
    group = CommercialLabs,
    "hosted-gallery-test",
    "If on, test page for gallery content is available",
    owners = Seq(Owner.withGithub("lps88")),
    safeState = Off,
    sellByDate = new LocalDate(2016, 7, 29),
    exposeClientSide = false
  )

  val hostedGalleryVisitBritain = Switch(
    group = CommercialLabs,
    "hosted-gallery-visit-britain",
    "If on, gallery pages for Visit Britain are available",
    owners = Seq(Owner.withGithub("lps88")),
    safeState = Off,
    sellByDate = new LocalDate(2016, 7, 29),
    exposeClientSide = false
  )

  val hostedLeffeShowVideo1 = Switch(
    group = CommercialLabs,
    name = "hosted-leffe-show-video-1",
    description = "Show video or else 404.",
    owners = Owner.group(CommercialLabs),
    safeState = Off,
    sellByDate = new LocalDate(2016, 8, 10),
    exposeClientSide = false
  )

  val hostedArticle = Switch(
    group = CommercialLabs,
    name = "hosted-article",
    description = "Show hosted article or 404.",
    owners = Owner.group(CommercialLabs),
    safeState = Off,
    sellByDate = new LocalDate(2016, 8, 17),
    exposeClientSide = false
  )

  val hostedContentTracking = Switch(
    group = CommercialLabs,
    name = "hosted-content-tracking",
    description = "Use special extra tracking parameters for hosted content",
    owners = Owner.group(CommercialLabs),
    safeState = Off,
    sellByDate = new LocalDate(2016, 7, 29),
    exposeClientSide = true
  )
}
