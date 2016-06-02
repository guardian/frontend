package conf.switches

import conf.switches.Expiry.never
import org.joda.time.LocalDate

trait PerformanceSwitches {

  val InlineJSStandardOptimisation = Switch(
    SwitchGroup.Performance,
    "inline-standard-optimisation",
    "If this switch is on, the inline JS will be compressed using closure compiler's standard optimisation instead of whitespace only",
    owners = Seq(Owner.withGithub("janua")),
    safeState = On,
    sellByDate = never,
    exposeClientSide = false
  )

  // Performance
  val LazyLoadContainersSwitch = Switch(
    SwitchGroup.Performance,
    "lazy-load-containers",
    "If this switch is on, containers past the 8th will be lazily loaded on mobile and tablet",
    owners = Seq(Owner.withGithub("johnduffell")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true
  )

  val TagPageSizeSwitch = Switch(
    SwitchGroup.Performance,
    "tag-page-size",
    "If this switch is on then we will request more items for larger tag pages",
    owners = Seq(Owner.withGithub("johnduffell")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = false
  )

  val LongCacheSwitch = Switch(
    SwitchGroup.Performance,
    "long-cache-switch",
    "If this switch is on then content will get a longer cache time",
    owners = Seq(Owner.withGithub("Grant Klopper")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = false
  )

  val CircuitBreakerSwitch = Switch(
    SwitchGroup.Performance,
    "circuit-breaker",
    "If this switch is switched on then the Content API circuit breaker will be operational",
    owners = Seq(Owner.withGithub("rich-nguyen")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = false
  )

  val ServerSideBucketsSwitch = Switch(
    SwitchGroup.Performance,
    "server-side-buckets",
    "When this switch expires, remove the remaining predefined server side testing buckets",
    owners = Seq(Owner.withGithub("johnduffell")),
    safeState = Off,
    sellByDate = new LocalDate(2016, 6, 22),
    exposeClientSide = false
  )

  val AutoRefreshSwitch = Switch(
    SwitchGroup.Performance,
    "auto-refresh",
    "Enables auto refresh in pages such as live blogs and live scores. Turn off to help handle exceptional load.",
    owners = Seq(Owner.withGithub("johnduffell")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true
  )

  val RelatedContentSwitch = Switch(
    SwitchGroup.Performance,
    "related-content",
    "If this switch is turned on then related content will show. Turn off to help handle exceptional load.",
    owners = Seq(Owner.withGithub("johnduffell")),
    safeState = On,
    sellByDate = never,
    exposeClientSide = true
  )

  val PanicMonitoringSwitch = Switch(
    SwitchGroup.Performance,
    "panic-monitoring",
    "If this switch is on, we monitor latency and requests to see if servers are overloaded",
    owners = Seq(Owner.withGithub("johnduffell")),
    safeState = Off,
    sellByDate = new LocalDate(2016, 7, 8),
    exposeClientSide = false
  )

  val PanicLoggingSwitch = Switch(
    SwitchGroup.Performance,
    "panic-logging",
    "If this switch is on, we log latency when we are monitoring it with panic-monitoring",
    owners = Seq(Owner.withGithub("johnduffell")),
    safeState = Off,
    sellByDate = new LocalDate(2016, 7, 8),
    exposeClientSide = false
  )

  val PanicSheddingSwitch = Switch(
    SwitchGroup.Performance,
    "panic-shedding",
    "If this switch is on, we try to keep response times below 1s by returning Service Unavailable errors if we're busy",
    owners = Seq(Owner.withGithub("johnduffell")),
    safeState = Off,
    sellByDate = new LocalDate(2016, 7, 8),
    exposeClientSide = false
  )

  val RichLinkSwitch = Switch(
    SwitchGroup.Performance,
    "rich-links",
    "If this switch is turned off then rich links will not be shown. Turn off to help handle exceptional load.",
    owners = Seq(Owner.withGithub("johnduffell")),
    safeState = On,
    sellByDate = never,
    exposeClientSide = false
  )

  val InlineCriticalCss = Switch(
    SwitchGroup.Performance,
    "inline-critical-css",
    "If this switch is on critical CSS will be inlined into the head of the document.",
    owners = Seq(Owner.withGithub("johnduffell")),
    safeState = On,
    sellByDate = never,
    exposeClientSide = false
  )

  val AsyncCss = Switch(
    SwitchGroup.Performance,
    "async-css",
    "If this switch is on CSS will be loaded with media set to 'only x' and updated to 'all' when the stylesheet " +
      "has loaded using javascript. Disabling it will use standard link elements.",
    owners = Seq(Owner.withGithub("johnduffell")),
    safeState = On,
    sellByDate = never,
    exposeClientSide = false
  )

  val ShowAllArticleEmbedsSwitch = Switch(
    SwitchGroup.Performance,
    "show-all-embeds",
    "If switched on then all embeds will be shown inside article bodies",
    owners = Seq(Owner.withGithub("johnduffell")),
    safeState = On,
    sellByDate = never,
    exposeClientSide = false
  )

  val ExternalVideoEmbeds = Switch(
    SwitchGroup.Performance,
    "external-video-embeds",
    "If switched on then we will accept and display external video views",
    owners = Seq(Owner.withGithub("johnduffell")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true
  )

  val DiscussionSwitch = Switch(
    SwitchGroup.Performance,
    "discussion",
    "If this switch is on, comments are displayed on articles. Turn this off if the Discussion API is blowing up.",
    owners = Seq(Owner.withGithub("johnduffell")),
    safeState = On,
    sellByDate = never,
    exposeClientSide = true
  )

  val DiscussionPageSizeSwitch = Switch(
    SwitchGroup.Performance,
    "discussion-page-size",
    "If this is switched on then users will have the option to change their discussion page size",
    owners = Seq(Owner.withGithub("johnduffell")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true
  )

  val OpenCtaSwitch = Switch(
    SwitchGroup.Performance,
    "open-cta",
    "If this switch is on, will see a CTA to comments on the right hand side. Turn this off if the Open API " +
      "is blowing up.",
    owners = Seq(Owner.withGithub("johnduffell")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true
  )

  val ImageServerSwitch = Switch(
    SwitchGroup.Performance,
    "image-server",
    "If this switch is on images will be served off i.guim.co.uk (dynamic image host).",
    owners = Seq(Owner.withGithub("johnduffell")),
    safeState = On,
    sellByDate = never,
    exposeClientSide = false
  )

  val DisableStickyAdBannerOnMobileSwitch = Switch(
    SwitchGroup.Performance,
    "disable-sticky-ad-banner-on-mobile",
    "If this switch is on, the sticky ad banner will be disabled on mobile.",
    owners = Seq(Owner.withName("health team")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true
  )

  val SaveForLaterSwitch = Switch(
    SwitchGroup.Performance,
    "save-for-later",
    "It this switch is turned on, user are able to save articles. Turn off if this causes overload on then identity api",
    owners = Seq(Owner.withGithub("johnduffell")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true
  )

  val ContentApiUseThrift = Switch(
    SwitchGroup.Performance,
    "content-api-use-thrift",
    "If this switch is on then content api calls will be requested in thrift format, instead of json format.",
    owners = Seq(Owner.withGithub("rich-nguyen")),
    safeState = Off,
    sellByDate = new LocalDate(2016, 8, 5),
    exposeClientSide = false
  )

  val UseLinkPreconnect = Switch(
    SwitchGroup.Performance,
    "use-link-preconnect",
    "If this switch is on then link preconnect hints will be on the page",
    owners = Seq(Owner.withGithub("rich-nguyen")),
    safeState = Off,
    sellByDate = new LocalDate(2016, 8, 5),
    exposeClientSide = false
  )
}
