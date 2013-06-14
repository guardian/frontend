package conf

import play.api.{ Application => PlayApp }
import common._
import com.gu.management._
import com.gu.management.play._
import logback.LogbackLevelPage
import contentapi.ContentApiMetrics

class SwitchBoardPlugin(app: PlayApp) extends SwitchBoardAgent(Configuration, Switches.all)

object DiscussionHttpTimingMetric extends TimingMetric(
  "performance",
  "discussion-api-calls",
  "Discussion API calls",
  "outgoing requests to discussion api"
) with TimingMetricLogging

object Metrics {
  val all: Seq[Metric] = ContentApiMetrics.all ++ CommonMetrics.all :+ DiscussionHttpTimingMetric
}

object Management extends Management {
  val applicationName = "frontend-discussion"

  lazy val pages = List(
    new ManifestPage,

    new UrlPagesHealthcheckManagementPage(
      "/discussion/p/3g9nk"
    ),
    StatusPage(applicationName, Metrics.all),
    new PropertiesPage(Configuration.toString),
    new LogbackLevelPage(applicationName)
  )
}
