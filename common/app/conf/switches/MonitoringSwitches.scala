package conf.switches

import conf.switches.Expiry.never

trait MonitoringSwitches {
  // Monitoring

  val OphanSwitch = Switch(
    SwitchGroup.Monitoring,
    "ophan",
    "Enables the new Ophan tracking javascript",
    owners = Seq(Owner.withName("unknown")),
    safeState = On,
    sellByDate = never,
    exposeClientSide = true,
  )

  val SentryReporting = Switch(
    SwitchGroup.Monitoring,
    "enable-sentry-reporting",
    "If this switch is on, then js errors will be reported to Sentry.",
    owners = Seq(Owner.withName("unknown")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true,
  )

  val ComscoreSwitch = Switch(
    SwitchGroup.Monitoring,
    "comscore",
    "If this switch is on, then Comscore reporting is enabled",
    owners = Seq(Owner.withName("unknown")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true,
  )

  val ThirdPartyEmbedTracking = Switch(
    SwitchGroup.Monitoring,
    "third-party-embed-tracking",
    "Enables tracking on our off-site third party embedded content. Such as: videos on embed.theguardian.com.",
    owners = Seq(Owner.withName("unknown")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true,
  )

  val LogstashLogging = Switch(
    SwitchGroup.Monitoring,
    "logstash-logging",
    "Enables sending logs to Logstash",
    owners = Seq(Owner.withName("unknown")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = false,
  )

  val BoostGAUserTimingFidelity = Switch(
    SwitchGroup.Monitoring,
    "boost-ga-user-timing-fidelity",
    "CAUTION: check with Google.Analyticscore@guardian.co.uk before enabling. Extends the standard 0.1% sampling of user timing events on Google Analytics to 100%. Will send a LOT more events to GA, which costs $$$.",
    owners = Seq(Owner.withName("unknown")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true,
  )

  val LogRemovedAmpElements = Switch(
    SwitchGroup.Monitoring,
    "log-removed-amp-elements",
    "Sends log messages to kibana whenever an element is removed from an AMP article.",
    owners = Seq(Owner.withName("unknown")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = false,
  )

  val CompareVariantDecisions = Switch(
    SwitchGroup.Monitoring,
    "compare-variant-decision",
    "forward contributions variant (ab test) decision to evaluate new service",
    owners = Seq(Owner.withEmail("slot.machine.dev@theguardian.com")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true,
  )

}
