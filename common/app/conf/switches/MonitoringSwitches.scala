package conf.switches

import conf.switches.Expiry.never
import org.joda.time.LocalDate

trait MonitoringSwitches {
  // Monitoring

  val OphanSwitch = Switch(
    "Monitoring",
    "ophan",
    "Enables the new Ophan tracking javascript",
    safeState = On,
    sellByDate = never,
    exposeClientSide = true
  )

  val DiagnosticsLogging = Switch(
    "Monitoring",
    "enable-diagnostics-logging",
    "If this switch is on, then js error reports and requests sent to the Diagnostics servers will be logged.",
    safeState = On,
    never,
    exposeClientSide = false
  )

  val MetricsSwitch = Switch(
    "Monitoring",
    "enable-metrics-non-prod",
    "If this switch is on, then metrics will be pushed to cloudwatch on DEV and CODE",
    safeState = Off,
    never,
    exposeClientSide = false
  )

  val ScrollDepthSwitch = Switch(
    "Monitoring",
    "scroll-depth",
    "Enables tracking and measurement of scroll depth",
    safeState = Off,
    never,
    exposeClientSide = true
  )

  val CssLogging = Switch(
    "Monitoring",
    "css-logging",
    "If this is on, then a subset of clients will post css selector information for diagnostics.",
    safeState = Off,
    never,
    exposeClientSide = true
  )

  val ThirdPartyEmbedTracking = Switch(
    "Monitoring",
    "third-party-embed-tracking",
    "Enables tracking on our off-site third party embedded content. Such as: videos on embed.theguardian.com.",
    safeState = Off,
    never,
    exposeClientSide = true
  )

  val SecureOmniture = Switch(
    "Monitoring",
    "secure-omniture",
    "Send omniture tracking to the https url for all pages",
    safeState = Off,
    new LocalDate(2015, 11, 16),
    exposeClientSide = false
  )

}
