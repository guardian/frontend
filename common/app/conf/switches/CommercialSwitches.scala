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

  val JobFeedReadSwitch = Switch(
    "Commercial",
    "gu-jobs-feed-read",
    "If this switch is on, cached jobs feed will be updated from external source.",
    safeState = Off,
    sellByDate = never,
    exposeClientSide = false
  )

  val JobParseSwitch = Switch(
    "Commercial",
    "gu-jobs-parse",
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

  val EventsFeedSwitch = Switch(
    "Commercial",
    "gu-events",
    "If this switch is on, commercial components will be fed by masterclass and live-events feeds.",
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
    sellByDate = new LocalDate(2016, 4, 13),
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

  val OutbrainOnAmp = Switch(
    "Commercial",
    "outbrain-on-amp",
    "Show an Outbrain component on amp pages",
    safeState = Off,
    sellByDate = new LocalDate(2016, 4, 5),
    exposeClientSide = false
  )

  val BritishCouncilBeacon = Switch(
    "Commercial",
    "british-council-beacon",
    "British Council's beacon",
    safeState = Off,
    sellByDate = new LocalDate(2016, 8, 1),
    exposeClientSide = false
  )

  val v2JobsTemplate = Switch(
    "Commercial",
    "v2-jobs-template",
    "Jobs component using template v2",
    safeState = Off,
    sellByDate = new LocalDate(2016, 4, 13),
    exposeClientSide = false
  )

  val v2MasterclassesTemplate = Switch(
    "Commercial",
    "v2-masterclasses-template",
    "Masterclasses component using template v2",
    safeState = Off,
    sellByDate = new LocalDate(2016, 4, 13),
    exposeClientSide = false
  )

  val v2BooksTemplate = Switch(
    "Commercial",
    "v2-books-template",
    "Books component using template v2",
    safeState = Off,
    sellByDate = new LocalDate(2016, 4, 13),
    exposeClientSide = false
  )

  val v2TravelTemplate = Switch(
    "Commercial",
    "v2-travel-template",
    "Travel component using template v2",
    safeState = Off,
    sellByDate = new LocalDate(2016, 4, 13),
    exposeClientSide = false
  )

  val v2SoulmatesTemplate = Switch(
    "Commercial",
    "v2-soulmates-template",
    "Soulmates component using template v2",
    safeState = Off,
    sellByDate = new LocalDate(2016, 4, 13),
    exposeClientSide = false
  )

  val v2BlendedTemplate = Switch(
    "Commercial",
    "v2-blended-template",
    "Blended component using template v2",
    safeState = Off,
    sellByDate = new LocalDate(2016, 4, 13),
    exposeClientSide = false
  )

  val v2ManualSingleTemplate = Switch(
    "Commercial",
    "v2-manual-single-template",
    "Manual single component using template v2",
    safeState = Off,
    sellByDate = new LocalDate(2016, 4, 13),
    exposeClientSide = false
  )

  val v2ManualMultipleTemplate = Switch(
    "Commercial",
    "v2-manual-multiple-template",
    "Manual multiple component using template v2",
    safeState = Off,
    sellByDate = new LocalDate(2016, 4, 13),
    exposeClientSide = false
  )

  val v2CapiSingleTemplate = Switch(
    "Commercial",
    "v2-capi-single-template",
    "Capi single component using template v2",
    safeState = Off,
    sellByDate = new LocalDate(2016, 4, 13),
    exposeClientSide = false
  )

  val v2CapiMultipleTemplate = Switch(
    "Commercial",
    "v2-capi-multiple-template",
    "Capi multiple component using template v2",
    safeState = Off,
    sellByDate = new LocalDate(2016, 4, 13),
    exposeClientSide = false
  )

  val v2PaidContainerTemplate = Switch(
    "Commercial",
    "v2-paid-container-template",
    "Paid containers using template v2",
    safeState = Off,
    sellByDate = new LocalDate(2016, 4, 13),
    exposeClientSide = false
  )

  val cardsDecidePaidContainerBranding = Switch(
    "Commercial",
    "cards-decide-paid-container-branding",
    "If on, the cards will decide the branding of their container",
    safeState = Off,
    sellByDate = new LocalDate(2016, 4, 13),
    exposeClientSide = false
  )
}
