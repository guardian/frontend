package conf.switches

import conf.switches.Expiry.never
import org.joda.time.LocalDate

trait CommercialSwitches {

  val DfpCachingSwitch = Switch(
    "Commercial",
    "dfp-caching",
    "Have Admin will poll DFP to precache adserving data.",
    safeState = On,
    sellByDate = never,
    exposeClientSide = false
  )

  val CommercialSwitch = Switch(
    "Commercial",
    "commercial",
    "If this switch is OFF, no calls will be made to the ad server. BEWARE!",
    safeState = On,
    sellByDate = never,
    exposeClientSide = true
  )

  val StandardAdvertsSwitch = Switch(
    "Commercial",
    "standard-adverts",
    "Display 'standard' adverts, e.g. top banner ads, inline ads, MPUs, etc.",
    safeState = On,
    sellByDate = never,
    exposeClientSide = true
  )

  val FluidAdvertsSwitch = Switch(
    "Commercial",
    "fluid-adverts",
    "Enable fluid ads, which occupy 100% of the width of their parent container but have a fixed height",
    safeState = Off,
    sellByDate = new LocalDate(2016, 2, 15),
    exposeClientSide = true
  )

  val CommercialComponentsSwitch = Switch(
    "Commercial",
    "commercial-components",
    "Display commercial components, e.g. jobs, soulmates.",
    safeState = On,
    sellByDate = never,
    exposeClientSide = true
  )

  val VideoAdvertsSwitch = Switch(
    "Commercial",
    "video-adverts",
    "Show adverts on videos.",
    safeState = On,
    sellByDate = never,
    exposeClientSide = true
  )

  val VpaidAdvertsSwitch = Switch(
    "Commercial",
    "vpaid-adverts",
    "Turns on support for vpaid-format adverts on videos.",
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true
  )

  val SponsoredSwitch = Switch(
    "Commercial",
    "sponsored",
    "Show sponsored badges, logos, etc.",
    safeState = On,
    sellByDate = never,
    exposeClientSide = true
  )

  val LiveblogAdvertsSwitch = Switch(
    "Commercial",
    "liveblog-adverts",
    "Show inline adverts on liveblogs",
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true
  )

  val LiveblogDynamicAdvertsSwitch = Switch(
    "Commercial",
    "liveblog-dynamic-adverts",
    "Dynamically insert inline adverts on liveblogs",
    safeState = Off,
    sellByDate = new LocalDate(2016, 2, 15),
    exposeClientSide = true
  )

  val AudienceScienceSwitch = Switch(
    "Commercial",
    "audience-science",
    "If this switch is on, Audience Science segments will be used to target ads.",
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true
  )

  val AudienceScienceGatewaySwitch = Switch(
    "Commercial",
    "audience-science-gateway",
    "If this switch is on, Audience Science Gateway segments will be used to target ads.",
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true
  )

  val ImrWorldwideSwitch = Switch(
    "Commercial",
    "imr-worldwide",
    "Enable the IMR Worldwide audience segment tracking.",
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true
  )

  val KruxSwitch = Switch(
    "Commercial",
    "krux",
    "Enable Krux Control Tag",
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true
  )

  val RemarketingSwitch = Switch(
    "Commercial",
    "remarketing",
    "Enable Remarketing tracking",
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true
  )

  val TravelOffersFeedSwitch = Switch(
    "Commercial",
    "gu-travel-offers",
    "If this switch is on, commercial components will be fed by travel offer feed.",
    safeState = Off,
    sellByDate = never,
    exposeClientSide = false
  )

  val JobFeedSwitch = Switch(
    "Commercial",
    "gu-jobs",
    "If this switch is on, commercial components will be fed by job feed.",
    safeState = Off,
    sellByDate = never,
    exposeClientSide = false
  )

  val MembersAreaSwitch = Switch(
    "Commercial",
    "gu-members-area",
    "If this switch is on, content flagged with membershipAccess will be protected",
    safeState = On,
    sellByDate = never,
    exposeClientSide = false
  )

  val MasterclassFeedSwitch = Switch(
    "Commercial",
    "gu-masterclasses",
    "If this switch is on, commercial components will be fed by masterclass feed.",
    safeState = Off,
    sellByDate = never,
    exposeClientSide = false
  )

  val SoulmatesFeedSwitch = Switch(
    "Commercial",
    "gu-soulmates",
    "If this switch is on, commercial components will be fed by soulmates feed.",
    safeState = Off,
    sellByDate = never,
    exposeClientSide = false
  )

  val MoneysupermarketFeedsSwitch = Switch(
    "Commercial",
    "moneysupermarket",
    "If this switch is on, commercial components will be fed by Moneysupermarket feeds.",
    safeState = Off,
    sellByDate = never,
    exposeClientSide = false
  )

  val LCMortgageFeedSwitch = Switch(
    "Commercial",
    "lc-mortgages",
    "If this switch is on, commercial components will be fed by London & Country mortgage feed.",
    safeState = Off,
    sellByDate = never,
    exposeClientSide = false
  )

  val GuBookshopFeedsSwitch = Switch(
    "Commercial",
    "gu-bookshop",
    "If this switch is on, commercial components will be fed by the Guardian Bookshop feed.",
    safeState = Off,
    sellByDate = never,
    exposeClientSide = false
  )

  val BookLookupSwitch = Switch(
    "Commercial",
    "book-lookup",
    "If this switch is on, book data will be looked up using a third-party service.",
    safeState = Off,
    sellByDate = never,
    exposeClientSide = false
  )

  val AdBlockMessage = Switch(
    "Commercial",
    "adblock",
    "Switch for the Adblock Message.",
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true
  )

  val FixedTopAboveNavAdSlotSwitch = Switch(
    "Commercial",
    "fixed-top-above-nav",
    "Fixes size of top-above-nav ad slot on fronts.",
    safeState = Off,
    sellByDate = new LocalDate(2016, 3, 16),
    exposeClientSide = false
  )

  val KruxVideoTracking = Switch(
    "Commercial",
    "krux-video-tracking",
    "If this switch is ON, there will be a Krux pixel fired to track particular videos",
    safeState = On,
    sellByDate = never,
    exposeClientSide = true
  )

  val AdFreeExperience = Switch(
    "Commercial",
    "advert-opt-out",
    "Enable adfree experience. See with cookie 'gu_adfree_user' = true",
    safeState = Off,
    sellByDate = new LocalDate(2016, 2, 1),
    exposeClientSide = true
  )

  val NewCommercialContent = Switch(
    "Commercial",
    "new-commercial-content",
    "New commercial content designs",
    safeState = Off,
    sellByDate = new LocalDate(2016, 2, 1),
    exposeClientSide = true
  )
}
