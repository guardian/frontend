package conf.switches

import conf.switches.Expiry.never
import org.joda.time.LocalDate

trait PerformanceSwitches {

  val InlineJSStandardOptimisation = Switch(
    SwitchGroup.Performance,
    "inline-standard-optimisation",
    "If this switch is on, the inline JS will be compressed using closure compiler's standard optimisation instead of whitespace only",
    safeState = On,
    sellByDate = never,
    exposeClientSide = false
  )

  // Performance
  val LazyLoadContainersSwitch = Switch(
    SwitchGroup.Performance,
    "lazy-load-containers",
    "If this switch is on, containers past the 8th will be lazily loaded on mobile and tablet",
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true
  )

  val TagPageSizeSwitch = Switch(
    SwitchGroup.Performance,
    "tag-page-size",
    "If this switch is on then we will request more items for larger tag pages",
    safeState = Off,
    sellByDate = never,
    exposeClientSide = false
  )

  val SoftPurgeSwitch = Switch(
    SwitchGroup.Performance,
    "soft-purge-switch",
    "If this switch is on then articles will be automatically soft purged them from the CDN",
    safeState = Off,
    sellByDate = never,
    exposeClientSide = false
  )

  val LongCacheSwitch = Switch(
    SwitchGroup.Performance,
    "long-cache-switch",
    "If this switch is on then articles will get a longer cache time",
    safeState = Off,
    sellByDate = never,
    exposeClientSide = false
  )

  val CheckETagsSwitch = Switch(
    SwitchGroup.Performance,
    "check-etags",
    "If this switch is on, empty 304 not modified responses will be returned for requests with the correct etag",
    safeState = Off,
    sellByDate = new LocalDate(2016, 5, 20),
    exposeClientSide = false
  )

  val CircuitBreakerSwitch = Switch(
    SwitchGroup.Performance,
    "circuit-breaker",
    "If this switch is switched on then the Content API circuit breaker will be operational",
    safeState = Off,
    sellByDate = never,
    exposeClientSide = false
  )

  val AutoRefreshSwitch = Switch(
    SwitchGroup.Performance,
    "auto-refresh",
    "Enables auto refresh in pages such as live blogs and live scores. Turn off to help handle exceptional load.",
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true
  )

  val DoubleCacheTimesSwitch = Switch(
    SwitchGroup.Performance,
    "double-cache-times",
    "Doubles the cache time of every endpoint. Turn on to help handle exceptional load.",
    safeState = On,
    sellByDate = never,
    exposeClientSide = false
  )

  val RelatedContentSwitch = Switch(
    SwitchGroup.Performance,
    "related-content",
    "If this switch is turned on then related content will show. Turn off to help handle exceptional load.",
    safeState = On,
    sellByDate = never,
    exposeClientSide = true
  )

  val RichLinkSwitch = Switch(
    SwitchGroup.Performance,
    "rich-links",
    "If this switch is turned off then rich links will not be shown. Turn off to help handle exceptional load.",
    safeState = On,
    sellByDate = never,
    exposeClientSide = false
  )

  val InlineCriticalCss = Switch(
    SwitchGroup.Performance,
    "inline-critical-css",
    "If this switch is on critical CSS will be inlined into the head of the document.",
    safeState = On,
    sellByDate = never,
    exposeClientSide = false
  )

  val AsyncCss = Switch(
    SwitchGroup.Performance,
    "async-css",
    "If this switch is on CSS will be loaded with media set to 'only x' and updated to 'all' when the stylesheet " +
      "has loaded using javascript. Disabling it will use standard link elements.",
    safeState = On,
    sellByDate = never,
    exposeClientSide = false
  )

  val ShowAllArticleEmbedsSwitch = Switch(
    SwitchGroup.Performance,
    "show-all-embeds",
    "If switched on then all embeds will be shown inside article bodies",
    safeState = On,
    sellByDate = never,
    exposeClientSide = false
  )

  val ExternalVideoEmbeds = Switch(
    SwitchGroup.Performance,
    "external-video-embeds",
    "If switched on then we will accept and display external video views",
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true
  )

  val DiscussionSwitch = Switch(
    SwitchGroup.Performance,
    "discussion",
    "If this switch is on, comments are displayed on articles. Turn this off if the Discussion API is blowing up.",
    safeState = On,
    sellByDate = never,
    exposeClientSide = true
  )

  val DiscussionPageSizeSwitch = Switch(
    SwitchGroup.Performance,
    "discussion-page-size",
    "If this is switched on then users will have the option to change their discussion page size",
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true
  )

  val OpenCtaSwitch = Switch(
    SwitchGroup.Performance,
    "open-cta",
    "If this switch is on, will see a CTA to comments on the right hand side. Turn this off if the Open API " +
      "is blowing up.",
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true
  )

  val ImageServerSwitch = Switch(
    SwitchGroup.Performance,
    "image-server",
    "If this switch is on images will be served off i.guim.co.uk (dynamic image host).",
    safeState = On,
    sellByDate = never,
    exposeClientSide = false
  )

  val Viewability = Switch(
    SwitchGroup.Performance,
    "viewability",
    "Viewability - Includes whole viewability package: ads lazy loading, sticky ad banner, sticky MPU, spacefinder 2.0, dynamic ads, ad next to comments",
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true
  )

  val DisableStickyAdBannerOnMobileSwitch = Switch(
    SwitchGroup.Performance,
    "disable-sticky-ad-banner-on-mobile",
    "If this switch is on, the sticky ad banner will be disabled on mobile.",
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true
  )

  val SaveForLaterSwitch = Switch(
    SwitchGroup.Performance,
    "save-for-later",
    "It this switch is turned on, user are able to save articles. Turn off if this causes overload on then identity api",
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true
  )

  val IphoneConfidence = Switch(
    SwitchGroup.Performance,
    "iphone-confidence",
    "If this switch is on then some beacons will be dropped to gauge iPhone confidence",
    safeState = Off,
    sellByDate = never,
    exposeClientSide = false
  )

  val ContentApiUseThrift = Switch(
    SwitchGroup.Performance,
    "content-api-use-thrift",
    "If this switch is on then content api calls will be requested in thrift format, instead of json format.",
    safeState = Off,
    sellByDate = new LocalDate(2016, 8, 5),
    exposeClientSide = false
  )

}
