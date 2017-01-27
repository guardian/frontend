package conf.switches

import conf.switches.Expiry.never

trait MonitoringSwitches {
  // Monitoring

  val OphanSwitch = Switch(
    SwitchGroup.Monitoring,
    "ophan",
    "Enables the new Ophan tracking javascript",
    owners = Seq(Owner.withGithub("johnduffell")),
    safeState = On,
    sellByDate = never,
    exposeClientSide = true
  )

  val SentryReporting = Switch(
    SwitchGroup.Monitoring,
    "enable-sentry-reporting",
    "If this switch is on, then js errors will be reported to Sentry.",
    owners = Seq(Owner.withGithub("rich-nguyen")),
    safeState = Off,
    never,
    exposeClientSide = true
  )

  val ComscoreSwitch = Switch(
    SwitchGroup.Monitoring,
    "comscore",
    "If this switch is on, then Comscore reporting is enabled",
    owners = Seq(Owner.withGithub("cb372")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = false
  )

  val ScrollDepthSwitch = Switch(
    SwitchGroup.Monitoring,
    "scroll-depth",
    "Enables tracking and measurement of scroll depth",
    owners = Seq(Owner.withGithub("johnduffell")),
    safeState = Off,
    never,
    exposeClientSide = true
  )

  val CssLogging = Switch(
    SwitchGroup.Monitoring,
    "css-logging",
    "If this is on, then a subset of clients will post css selector information for diagnostics.",
    owners = Seq(Owner.withGithub("johnduffell")),
    safeState = Off,
    never,
    exposeClientSide = true
  )

  val CspReporting = Switch(
    SwitchGroup.Monitoring,
    "csp-reporting",
    "Enables logging of CSP violations",
    owners = Seq(Owner.withGithub("desbo")),
    safeState = Off,
    never,
    exposeClientSide = false
  )

  val ThirdPartyEmbedTracking = Switch(
    SwitchGroup.Monitoring,
    "third-party-embed-tracking",
    "Enables tracking on our off-site third party embedded content. Such as: videos on embed.theguardian.com.",
    owners = Seq(Owner.withGithub("johnduffell")),
    safeState = Off,
    never,
    exposeClientSide = true
  )

  val LogstashLogging = Switch(
    SwitchGroup.Monitoring,
    "logstash-logging",
    "Enables sending logs to Logstash",
    owners = Seq(Owner.withGithub("tbonnin")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = false
  )

  val GAMegaPerfMonitoring = Switch(
    SwitchGroup.Monitoring,
    "ga-mega-perf-monitoring",
    "**CHECK WITH Google.Analyticscore@guardian.co.uk BEFORE ENABLING** – sends GA timing events as standard events, to avoid the 0.1% sampling that affects timing events. Will send a LOT more JS timing events to GA.",
    owners = Seq(Owner.withGithub("sndrs")),
    safeState = Off,
    never,
    exposeClientSide = true
  )

}
