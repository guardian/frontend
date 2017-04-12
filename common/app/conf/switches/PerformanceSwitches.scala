package conf.switches

import conf.switches.Expiry.never

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
    owners = Owner.group(SwitchGroup.Performance),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = false
  )

  val interactivePressing = Switch(
    SwitchGroup.Performance,
    "interactive-pressing",
    "If this switch is switched on then immersive interactives that are supplied as markup in Composer will be pressed into the page",
    owners = Seq(Owner.withGithub("sammorrisdesign")),
    safeState = On,
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

  val PolyfillIO = Switch(
    SwitchGroup.Performance,
    "polyfill-io",
    "If this switch is on we will attempt to load polyfills from polyfill.io. If it is off, only our (full, larger) fullback will be loaded.",
    owners = Seq(Owner.withGithub("sndrs")),
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
}
