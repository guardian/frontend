package conf.switches

import conf.switches.Expiry.never
import java.time.LocalDate

trait PerformanceSwitches {

  val InlineJSStandardOptimisation = Switch(
    SwitchGroup.Performance,
    "inline-standard-optimisation",
    "If this switch is on, the inline JS will be compressed using closure compiler's standard optimisation instead of whitespace only",
    owners = Seq(Owner.withName("unknown")),
    safeState = On,
    sellByDate = never,
    exposeClientSide = false,
  )

  // Performance
  val LazyLoadContainersSwitch = Switch(
    SwitchGroup.Performance,
    "lazy-load-containers",
    "If this switch is on, containers past the 8th will be lazily loaded on mobile and tablet",
    owners = Seq(Owner.withGithub("johnduffell")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true,
  )

  val LongCacheSwitch = Switch(
    SwitchGroup.Performance,
    "long-cache-switch",
    "If this switch is on then content will get a longer cache time",
    owners = Seq(Owner.withName("unknown")),
    safeState = On,
    sellByDate = never,
    exposeClientSide = false,
  )

  val PanicShedding = Switch(
    SwitchGroup.Performance,
    "panic-shedding",
    "If this switch is on then all apps will return 304 Not Modified to all requests with an If-None-Match header (aka 'serve stale whenever possible')",
    owners = Seq(Owner.withName("unknown")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = false,
  )

  val interactivePressing = Switch(
    SwitchGroup.Performance,
    "interactive-pressing",
    "If this switch is switched on then immersive interactives that are supplied as markup in Composer will be pressed into the page",
    owners = Seq(Owner.withName("unknown")),
    safeState = On,
    sellByDate = never,
    exposeClientSide = false,
  )

  val CircuitBreakerSwitch = Switch(
    SwitchGroup.Performance,
    "circuit-breaker",
    "If this switch is switched on then the Content API circuit breaker will be operational",
    owners = Seq(Owner.withName("unknown")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = false,
  )

  val AutoRefreshSwitch = Switch(
    SwitchGroup.Performance,
    "auto-refresh",
    "Enables auto refresh in pages such as live blogs and live scores. Turn off to help handle exceptional load.",
    owners = Seq(Owner.withGithub("johnduffell")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true,
  )

  val RelatedContentSwitch = Switch(
    SwitchGroup.Performance,
    "related-content",
    "If this switch is turned on then related content will show. Turn off to help handle exceptional load.",
    owners = Seq(Owner.withGithub("johnduffell")),
    safeState = On,
    sellByDate = never,
    exposeClientSide = true,
  )

  val RichLinkSwitch = Switch(
    SwitchGroup.Performance,
    "rich-links",
    "If this switch is turned off then rich links will not be shown. Turn off to help handle exceptional load.",
    owners = Seq(Owner.withGithub("johnduffell")),
    safeState = On,
    sellByDate = never,
    exposeClientSide = false,
  )

  val InlineCriticalCss = Switch(
    SwitchGroup.Performance,
    "inline-critical-css",
    "If this switch is on critical CSS will be inlined into the head of the document.",
    owners = Seq(Owner.withGithub("johnduffell")),
    safeState = On,
    sellByDate = never,
    exposeClientSide = false,
  )

  val AsyncCss = Switch(
    SwitchGroup.Performance,
    "async-css",
    "If this switch is on CSS will be loaded with media set to 'only x' and updated to 'all' when the stylesheet " +
      "has loaded using javascript. Disabling it will use standard link elements.",
    owners = Seq(Owner.withGithub("johnduffell")),
    safeState = On,
    sellByDate = never,
    exposeClientSide = false,
  )

  val PolyfillIO = Switch(
    SwitchGroup.Performance,
    "polyfill-io",
    "If this switch is on we will attempt to load polyfills from polyfill.io. If it is off, only our (full, larger) fullback will be loaded.",
    owners = Seq(Owner.withName("unknown")),
    safeState = On,
    sellByDate = never,
    exposeClientSide = false,
  )

  val PolyfillIOFallbackMin = Switch(
    SwitchGroup.Performance,
    "polyfill-io-fallback-min",
    "If this switch is on we will load intersectionObserver and URL (UrlSearchParams) fallback polyfills from our own servers",
    owners = Seq(Owner.withName("unknown")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = false,
  )

  val ShowAllArticleEmbedsSwitch = Switch(
    SwitchGroup.Performance,
    "show-all-embeds",
    "If switched on then all embeds will be shown inside article bodies",
    owners = Seq(Owner.withGithub("johnduffell")),
    safeState = On,
    sellByDate = never,
    exposeClientSide = false,
  )

  val ExternalVideoEmbeds = Switch(
    SwitchGroup.Performance,
    "external-video-embeds",
    "If switched on then we will accept and display external video views",
    owners = Seq(Owner.withGithub("johnduffell")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true,
  )

  val DiscussionPageSizeSwitch = Switch(
    SwitchGroup.Performance,
    "discussion-page-size",
    "If this is switched on then users will have the option to change their discussion page size",
    owners = Seq(Owner.withGithub("johnduffell")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true,
  )

  val ImageServerSwitch = Switch(
    SwitchGroup.Performance,
    "image-server",
    "If this switch is on images will be served off i.guim.co.uk (dynamic image host).",
    owners = Seq(Owner.withGithub("johnduffell")),
    safeState = On,
    sellByDate = never,
    exposeClientSide = false,
  )

  val LazyLoadImages = Switch(
    SwitchGroup.Performance,
    "blink-lazy-load-images",
    "If switched on, explicitly request lazy loading of images on supporting browsers.",
    owners = Seq(Owner.withGithub("nicl")),
    safeState = On,
    sellByDate = never,
    exposeClientSide = false,
  )
}
