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
    SwitchGroup.CommercialFeeds,
    "gu-travel-feed-fetch",
    "If this switch is on, cached travel offers feed will be updated from external source.",
    safeState = Off,
    sellByDate = never,
    exposeClientSide = false
  )

  val TravelFeedParseSwitch = Switch(
    SwitchGroup.CommercialFeeds,
    "gu-travel-feed-parse",
    "If this switch is on, commercial components will be fed by travel offers feed.",
    safeState = Off,
    sellByDate = never,
    exposeClientSide = false
  )

  val JobsFeedFetchSwitch = Switch(
    SwitchGroup.CommercialFeeds,
    "gu-jobs-feed-fetch",
    "If this switch is on, jobs feed will be periodically updated from external source.",
    safeState = Off,
    sellByDate = never,
    exposeClientSide = false
  )

  val JobsFeedParseSwitch = Switch(
    SwitchGroup.CommercialFeeds,
    "gu-jobs-feed-parse",
    "If this switch is on, commercial components will be fed by jobs feed.",
    safeState = Off,
    sellByDate = never,
    exposeClientSide = false
  )

  val EventsFeedSwitch = Switch(
    SwitchGroup.CommercialFeeds,
    "gu-events",
    "If this switch is on, commercial components will be fed by masterclass and live-events feeds.",
    safeState = Off,
    sellByDate = never,
    exposeClientSide = false
  )

  val SoulmatesFeedSwitch = Switch(
    SwitchGroup.CommercialFeeds,
    "gu-soulmates",
    "If this switch is on, commercial components will be fed by soulmates feed.",
    safeState = Off,
    sellByDate = never,
    exposeClientSide = false
  )

  val MoneysupermarketFeedsSwitch = Switch(
    SwitchGroup.CommercialFeeds,
    "moneysupermarket",
    "If this switch is on, commercial components will be fed by Moneysupermarket feeds.",
    safeState = Off,
    sellByDate = never,
    exposeClientSide = false
  )

  val GuBookshopFeedsSwitch = Switch(
    SwitchGroup.CommercialFeeds,
    "gu-bookshop",
    "If this switch is on, commercial components will be fed by the Guardian Bookshop feed.",
    safeState = Off,
    sellByDate = never,
    exposeClientSide = false
  )

  val BookLookupSwitch = Switch(
    SwitchGroup.CommercialFeeds,
    "book-lookup",
    "If this switch is on, book data will be looked up using a third-party service.",
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

  val LCMortgageFeedSwitch = Switch(
    SwitchGroup.Commercial,
    "lc-mortgages",
    "If this switch is on, commercial components will be fed by London & Country mortgage feed.",
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

  val FabricAdverts = Switch(
    SwitchGroup.Commercial,
    "fabric-adverts",
    "Request 'fabric' format adverts (88x71s) from DFP",
    safeState = Off,
    sellByDate = new LocalDate(2016, 5, 31),
    exposeClientSide = true
  )

  val cardsDecidePaidContainerBranding = Switch(
    SwitchGroup.Commercial,
    "cards-decide-paid-container-branding",
    "DON'T TURN THIS ON! If on, the cards will decide the branding of their container",
    safeState = Off,
    sellByDate = new LocalDate(2016, 6, 1),
    exposeClientSide = false
  )

  val staticBadgesSwitch = Switch(
    SwitchGroup.Commercial,
    "static-badges",
    "If on, all badges are served server side",
    safeState = Off,
    sellByDate = new LocalDate(2016, 6, 22),
    exposeClientSide = true
  )

  val highMerchandisingComponentSwitch = Switch(
    SwitchGroup.Commercial,
    "optimise-high-merchandising",
    "If on, server will check tags for high-merchandising target before rendering high-merch slot.",
    safeState = Off,
    sellByDate = new LocalDate(2016,6,8),
    exposeClientSide = false
  )

  val CommercialAuditSwitch = Switch(
    SwitchGroup.Commercial,
    "commercial-audit",
    "Audit Ads",
    safeState = Off,
    sellByDate = new LocalDate(2016, 5, 24),
    exposeClientSide = true
  )

  val hostedEpisode1Content = Switch(
    SwitchGroup.Commercial,
    "hosted-episode1-content",
    "If on, another hardcoded page of hosted content is available",
    safeState = Off,
    sellByDate = new LocalDate(2016, 7, 12),
    exposeClientSide = false
  )
}
