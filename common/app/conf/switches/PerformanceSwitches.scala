package conf.switches

import conf.switches.Expiry.never
import org.joda.time.LocalDate

trait PerformanceSwitches {

  val InlineJSStandardOptimisation = Switch(
    "Performance",
    "inline-standard-optimisation",
    "If this switch is on, the inline JS will be compressed using closure compiler's standard optimisation instead of whitespace only",
    safeState = On,
    sellByDate = never,
    exposeClientSide = false
  )

  // Performance
  val LazyLoadContainersSwitch = Switch(
    "Performance",
    "lazy-load-containers",
    "If this switch is on, containers past the 8th will be lazily loaded on mobile and tablet",
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true
  )

  val TagPageSizeSwitch = Switch(
    "Performance",
    "tag-page-size",
    "If this switch is on then we will request more items for larger tag pages",
    safeState = Off,
    sellByDate = never,
    exposeClientSide = false
  )

  val SoftPurgeWithLongCachingSwitch = Switch(
    "Performance",
    "soft-purge-with-long-caching-switch",
    "If this switch is on then articles will get a longer cache time, but we will soft purge them from the CDN",
    safeState = Off,
    sellByDate = new LocalDate(2015, 11, 15),
    exposeClientSide = false
  )

  val CircuitBreakerSwitch = Switch(
    "Performance",
    "circuit-breaker",
    "If this switch is switched on then the Content API circuit breaker will be operational",
    safeState = Off,
    sellByDate = never,
    exposeClientSide = false
  )

  val MemcachedSwitch = Switch(
    "Performance",
    "memcached-action",
    "If this switch is switched on then the MemcacheAction will be operational",
    safeState = On,
    sellByDate = never,
    exposeClientSide = false
  )

  val MemcachedFallbackSwitch = Switch(
    "Performance",
    "memcached-fallback",
    "If this switch is switched on then the MemcachedFallback will be operational",
    safeState = Off,
    sellByDate = never,
    exposeClientSide = false
  )

  val IncludeBuildNumberInMemcachedKey = Switch(
    "Performance",
    "memcached-build-number",
    "If this switch is switched on then the MemcacheFilter will include the build number in the cache key",
    safeState = Off,
    sellByDate = never,
    exposeClientSide = false
  )

  val AutoRefreshSwitch = Switch(
    "Performance",
    "auto-refresh",
    "Enables auto refresh in pages such as live blogs and live scores. Turn off to help handle exceptional load.",
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true
  )

  val DoubleCacheTimesSwitch = Switch(
    "Performance",
    "double-cache-times",
    "Doubles the cache time of every endpoint. Turn on to help handle exceptional load.",
    safeState = On,
    sellByDate = never,
    exposeClientSide = false
  )

  val RelatedContentSwitch = Switch(
    "Performance",
    "related-content",
    "If this switch is turned on then related content will show. Turn off to help handle exceptional load.",
    safeState = On,
    sellByDate = never,
    exposeClientSide = true
  )

  val RichLinkSwitch = Switch(
    "Performance",
    "rich-links",
    "If this switch is turned off then rich links will not be shown. Turn off to help handle exceptional load.",
    safeState = On,
    sellByDate = never,
    exposeClientSide = false
  )

  val InlineCriticalCss = Switch(
    "Performance",
    "inline-critical-css",
    "If this switch is on critical CSS will be inlined into the head of the document.",
    safeState = On,
    sellByDate = never,
    exposeClientSide = false
  )

  val AsyncCss = Switch(
    "Performance",
    "async-css",
    "If this switch is on CSS will be loaded with media set to 'only x' and updated to 'all' when the stylesheet " +
      "has loaded using javascript. Disabling it will use standard link elements.",
    safeState = On,
    sellByDate = never,
    exposeClientSide = false
  )

  val ShowAllArticleEmbedsSwitch = Switch(
    "Performance",
    "show-all-embeds",
    "If switched on then all embeds will be shown inside article bodies",
    safeState = On,
    sellByDate = never,
    exposeClientSide = false
  )

  val ExternalVideoEmbeds = Switch(
    "Performance",
    "external-video-embeds",
    "If switched on then we will accept and display external video views",
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true
  )

  val DiscussionSwitch = Switch(
    "Performance",
    "discussion",
    "If this switch is on, comments are displayed on articles. Turn this off if the Discussion API is blowing up.",
    safeState = On,
    sellByDate = never,
    exposeClientSide = true
  )

  val DiscussionPageSizeSwitch = Switch(
    "Performance",
    "discussion-page-size",
    "If this is switched on then users will have the option to change their discussion page size",
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true
  )

  val OpenCtaSwitch = Switch(
    "Performance",
    "open-cta",
    "If this switch is on, will see a CTA to comments on the right hand side. Turn this off if the Open API " +
      "is blowing up.",
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true
  )

  val ImageServerSwitch = Switch(
    "Performance",
    "image-server",
    "If this switch is on images will be served off i.guim.co.uk (dynamic image host).",
    safeState = On,
    sellByDate = never,
    exposeClientSide = false
  )

  val Viewability = Switch(
    "Performance",
    "viewability",
    "Viewability - Includes whole viewability package: ads lazy loading, sticky header, sticky MPU, spacefinder 2.0, dynamic ads, ad next to comments",
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true
  )

  val DisableStickyNavOnMobileSwitch = Switch(
    "Performance",
    "disable-sticky-nav-on-mobile",
    "If this switch is on, the sticky nav will be disabled on mobile.",
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true
  )

  val SaveForLaterSwitch = Switch(
    "Performance",
    "save-for-later",
    "It this switch is turned on, user are able to save articles. Turn off if this causes overload on then identity api",
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true
  )

  val IphoneConfidence = Switch(
    "Performance",
    "iphone-confidence",
    "If this switch is on then some beacons will be dropped to gauge iPhone confidence",
    safeState = Off,
    sellByDate = never,
    exposeClientSide = false
  )

  val NoBounceIndicator = Switch(
    "Performance",
    "no-bounce-indicator",
    "If this switch is on then some beacons will be dropped to gauge if people move onto a new piece of content before Omniture runs",
    safeState = On,
    sellByDate = new LocalDate(2016, 1, 10),
    exposeClientSide = true
  )

  val ServeCoreFrontsToSomeIpadsSwitch = Switch(
    "Performance",
    "ipad-core-fronts",
    "Serve core fronts to a random percentage of crash-prone ipad users",
    safeState = Off,
    sellByDate = new LocalDate(2015, 10, 31),
    exposeClientSide = true
  )

}
