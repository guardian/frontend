package conf.switches

import conf.switches.Expiry.never
import org.joda.time.LocalDate

trait CommercialSwitches {

  val DfpCachingSwitch = Switch(
    SwitchGroup.Commercial,
    "dfp-caching",
    "Have Admin will poll DFP to precache adserving data.",
    safeState = On,
    sellByDate = never,
    exposeClientSide = false
  )

  val HeaderBiddingUS = Switch(
     SwitchGroup.Commercial,
     "header-bidding-us",
     "Auction adverts on the client before calling DFP (US edition only)",
     safeState = Off,
     sellByDate = never,
     exposeClientSide = true
  )

  val CommercialSwitch = Switch(
    SwitchGroup.Commercial,
    "commercial",
    "If this switch is OFF, no calls will be made to the ad server. BEWARE!",
    safeState = On,
    sellByDate = never,
    exposeClientSide = true
  )

  val StandardAdvertsSwitch = Switch(
    SwitchGroup.Commercial,
    "standard-adverts",
    "Display 'standard' adverts, e.g. top banner ads, inline ads, MPUs, etc.",
    safeState = On,
    sellByDate = never,
    exposeClientSide = true
  )

  val CommercialComponentsSwitch = Switch(
    SwitchGroup.Commercial,
    "commercial-components",
    "Display commercial components, e.g. jobs, soulmates.",
    safeState = On,
    sellByDate = never,
    exposeClientSide = true
  )

  val VideoAdvertsSwitch = Switch(
    SwitchGroup.Commercial,
    "video-adverts",
    "Show adverts on videos.",
    safeState = On,
    sellByDate = never,
    exposeClientSide = true
  )

  val SponsoredSwitch = Switch(
    SwitchGroup.Commercial,
    "sponsored",
    "Show sponsored badges, logos, etc.",
    safeState = On,
    sellByDate = never,
    exposeClientSide = true
  )

  val LiveblogAdvertsSwitch = Switch(
    SwitchGroup.Commercial,
    "liveblog-adverts",
    "Show inline adverts on liveblogs",
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true
  )

  val AudienceScienceSwitch = Switch(
    SwitchGroup.Commercial,
    "audience-science",
    "If this switch is on, Audience Science segments will be used to target ads.",
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true
  )

  val AudienceScienceGatewaySwitch = Switch(
    SwitchGroup.Commercial,
    "audience-science-gateway",
    "If this switch is on, Audience Science Gateway segments will be used to target ads.",
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true
  )

  val ImrWorldwideSwitch = Switch(
    SwitchGroup.Commercial,
    "imr-worldwide",
    "Enable the IMR Worldwide audience segment tracking.",
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true
  )

  val KruxSwitch = Switch(
    SwitchGroup.Commercial,
    "krux",
    "Enable Krux Control Tag",
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true
  )

  val RemarketingSwitch = Switch(
    SwitchGroup.Commercial,
    "remarketing",
    "Enable Remarketing tracking",
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true
  )

  val TravelFeedFetchSwitch = Switch(
    SwitchGroup.Commercial,
    "gu-travel-feed-fetch",
    "If this switch is on, cached travel offers feed will be updated from external source.",
    safeState = Off,
    sellByDate = never,
    exposeClientSide = false
  )

  val TravelFeedParseSwitch = Switch(
    SwitchGroup.Commercial,
    "gu-travel-feed-parse",
    "If this switch is on, commercial components will be fed by travel offers feed.",
    safeState = Off,
    sellByDate = never,
    exposeClientSide = false
  )

  val JobsFeedFetchSwitch = Switch(
    SwitchGroup.Commercial,
    "gu-jobs-feed-fetch",
    "If this switch is on, jobs feed will be periodically updated from external source.",
    safeState = Off,
    sellByDate = never,
    exposeClientSide = false
  )

  val JobsFeedParseSwitch = Switch(
    SwitchGroup.Commercial,
    "gu-jobs-feed-parse",
    "If this switch is on, commercial components will be fed by jobs feed.",
    safeState = Off,
    sellByDate = never,
    exposeClientSide = false
  )

  val MembersAreaSwitch = Switch(
    SwitchGroup.Commercial,
    "gu-members-area",
    "If this switch is on, content flagged with membershipAccess will be protected",
    safeState = On,
    sellByDate = never,
    exposeClientSide = false
  )

  val EventsFeedSwitch = Switch(
    SwitchGroup.Commercial,
    "gu-events",
    "If this switch is on, commercial components will be fed by masterclass and live-events feeds.",
    safeState = Off,
    sellByDate = never,
    exposeClientSide = false
  )

  val SoulmatesFeedSwitch = Switch(
    SwitchGroup.Commercial,
    "gu-soulmates",
    "If this switch is on, commercial components will be fed by soulmates feed.",
    safeState = Off,
    sellByDate = never,
    exposeClientSide = false
  )

  val MoneysupermarketFeedsSwitch = Switch(
    SwitchGroup.Commercial,
    "moneysupermarket",
    "If this switch is on, commercial components will be fed by Moneysupermarket feeds.",
    safeState = Off,
    sellByDate = never,
    exposeClientSide = false
  )

  val LCMortgageFeedSwitch = Switch(
    SwitchGroup.Commercial,
    "lc-mortgages",
    "If this switch is on, commercial components will be fed by London & Country mortgage feed.",
    safeState = Off,
    sellByDate = never,
    exposeClientSide = false
  )

  val GuBookshopFeedsSwitch = Switch(
    SwitchGroup.Commercial,
    "gu-bookshop",
    "If this switch is on, commercial components will be fed by the Guardian Bookshop feed.",
    safeState = Off,
    sellByDate = never,
    exposeClientSide = false
  )

  val BookLookupSwitch = Switch(
    SwitchGroup.Commercial,
    "book-lookup",
    "If this switch is on, book data will be looked up using a third-party service.",
    safeState = Off,
    sellByDate = never,
    exposeClientSide = false
  )

  val AdBlockMessage = Switch(
    SwitchGroup.Commercial,
    "adblock",
    "Switch for the Adblock Message.",
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true
  )

  val FixedTopAboveNavAdSlotSwitch = Switch(
    SwitchGroup.Commercial,
    "fixed-top-above-nav",
    "Fixes size of top-above-nav ad slot on fronts.",
    safeState = Off,
    sellByDate = new LocalDate(2016, 4, 27),
    exposeClientSide = false
  )

  val KruxVideoTracking = Switch(
    SwitchGroup.Commercial,
    "krux-video-tracking",
    "If this switch is ON, there will be a Krux pixel fired to track particular videos",
    safeState = On,
    sellByDate = never,
    exposeClientSide = true
  )

  val BritishCouncilBeacon = Switch(
    SwitchGroup.Commercial,
    "british-council-beacon",
    "British Council's beacon",
    safeState = Off,
    sellByDate = new LocalDate(2016, 8, 1),
    exposeClientSide = false
  )

  val v2JobsTemplate = Switch(
    SwitchGroup.Commercial,
    "v2-jobs-template",
    "Jobs component using template v2",
    safeState = Off,
    sellByDate = new LocalDate(2016, 4, 27),
    exposeClientSide = false
  )

  val v2MasterclassesTemplate = Switch(
    SwitchGroup.Commercial,
    "v2-masterclasses-template",
    "Masterclasses component using template v2",
    safeState = Off,
    sellByDate = new LocalDate(2016, 4, 27),
    exposeClientSide = false
  )

  val v2BooksTemplate = Switch(
    SwitchGroup.Commercial,
    "v2-books-template",
    "Books component using template v2",
    safeState = Off,
    sellByDate = new LocalDate(2016, 4, 27),
    exposeClientSide = false
  )

  val v2TravelTemplate = Switch(
    SwitchGroup.Commercial,
    "v2-travel-template",
    "Travel component using template v2",
    safeState = Off,
    sellByDate = new LocalDate(2016, 4, 27),
    exposeClientSide = false
  )

  val v2SoulmatesTemplate = Switch(
    SwitchGroup.Commercial,
    "v2-soulmates-template",
    "Soulmates component using template v2",
    safeState = Off,
    sellByDate = new LocalDate(2016, 4, 27),
    exposeClientSide = false
  )

  val v2BlendedTemplate = Switch(
    SwitchGroup.Commercial,
    "v2-blended-template",
    "Blended component using template v2",
    safeState = Off,
    sellByDate = new LocalDate(2016, 4, 27),
    exposeClientSide = false
  )

  val v2ManualSingleTemplate = Switch(
    SwitchGroup.Commercial,
    "v2-manual-single-template",
    "Manual single component using template v2",
    safeState = Off,
    sellByDate = new LocalDate(2016, 4, 27),
    exposeClientSide = true
  )

  val v2ManualMultipleTemplate = Switch(
    SwitchGroup.Commercial,
    "v2-manual-multiple-template",
    "Manual multiple component using template v2",
    safeState = Off,
    sellByDate = new LocalDate(2016, 4, 27),
    exposeClientSide = true
  )

  val v2CapiSingleTemplate = Switch(
    SwitchGroup.Commercial,
    "v2-capi-single-template",
    "Capi single component using template v2",
    safeState = Off,
    sellByDate = new LocalDate(2016, 4, 27),
    exposeClientSide = false
  )

  val v2CapiMultipleTemplate = Switch(
    SwitchGroup.Commercial,
    "v2-capi-multiple-template",
    "Capi multiple component using template v2",
    safeState = Off,
    sellByDate = new LocalDate(2016, 4, 27),
    exposeClientSide = false
  )

  val v2FixedContainerTemplate = Switch(
    SwitchGroup.Commercial,
    "v2-fixed-container-template",
    "Fixed paid containers using template v2",
    safeState = Off,
    sellByDate = new LocalDate(2016, 4, 27),
    exposeClientSide = false
  )

  val v2DynamicContainerTemplate = Switch(
    SwitchGroup.Commercial,
    "v2-dynamic-container-template",
    "Dynamic paid containers using template v2",
    safeState = Off,
    sellByDate = new LocalDate(2016, 4, 27),
    exposeClientSide = false
  )

  val cardsDecidePaidContainerBranding = Switch(
    SwitchGroup.Commercial,
    "cards-decide-paid-container-branding",
    "If on, the cards will decide the branding of their container",
    safeState = Off,
    sellByDate = new LocalDate(2016, 4, 27),
    exposeClientSide = false
  )

  val staticBadgesSwitch = Switch(
    SwitchGroup.Commercial,
    "static-badges",
    "If on, all badges are served server side",
    safeState = Off,
    sellByDate = new LocalDate(2016, 5, 25),
    exposeClientSide = true
  )

  val requestOutOfPageSlotAlways = Switch(
    SwitchGroup.Commercial,
    "request-out-of-page-slot-always",
    "If on, the out of page slot (1x1) will be added to each page, regardless of pageskins, surveys or other dependent features",
    safeState = Off,
    sellByDate = new LocalDate(2016, 5, 3),
    exposeClientSide =  false
  )
}
