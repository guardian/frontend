package conf.switches

import conf.switches.Expiry.never
import org.joda.time.LocalDate

trait MonitoringSwitches {
  // Monitoring

  val OphanSwitch = Switch(
    SwitchGroup.Monitoring,
    "ophan",
    "Enables the new Ophan tracking javascript",
    safeState = On,
    sellByDate = never,
    exposeClientSide = true
  )

  val SentryReporting = Switch(
    SwitchGroup.Monitoring,
    "enable-sentry-reporting",
    "If this switch is on, then js errors will be reported to Sentry.",
    safeState = Off,
    never,
    exposeClientSide = true
  )

  val GoogleAnalyticsSwitch = Switch(
    SwitchGroup.Monitoring,
    "google-analytics",
    "If this switch is on, then Google Analytics is enabled",
    safeState = Off,
    sellByDate = new LocalDate(2016, 8, 26),
    exposeClientSide = false
  )

  val ScrollDepthSwitch = Switch(
    SwitchGroup.Monitoring,
    "scroll-depth",
    "Enables tracking and measurement of scroll depth",
    safeState = Off,
    never,
    exposeClientSide = true
  )

  val CssLogging = Switch(
    SwitchGroup.Monitoring,
    "css-logging",
    "If this is on, then a subset of clients will post css selector information for diagnostics.",
    safeState = Off,
    never,
    exposeClientSide = true
  )

  val CspReporting = Switch(
    SwitchGroup.Monitoring,
    "csp-reporting",
    "Enables logging of CSP violations",
    safeState = Off,
    never,
    exposeClientSide = false
  )

  val ThirdPartyEmbedTracking = Switch(
    SwitchGroup.Monitoring,
    "third-party-embed-tracking",
    "Enables tracking on our off-site third party embedded content. Such as: videos on embed.theguardian.com.",
    safeState = Off,
    never,
    exposeClientSide = true
  )

  val LogstashLogging = Switch(
    SwitchGroup.Monitoring,
    "logstash-logging",
    "Enables sending logs to Logstash",
    safeState = Off,
    sellByDate = never,
    exposeClientSide = false
  )

}
