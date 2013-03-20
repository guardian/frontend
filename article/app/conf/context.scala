package conf

import common._
import _root_.play.api.{ Application => PlayApp }
import com.gu.management.play._
import com.gu.management._
import logback.LogbackLevelPage

object Switches {
  val all: Seq[Switchable] = CommonSwitches.all
}

class SwitchBoardPlugin(app: PlayApp) extends SwitchBoardAgent(Configuration, Switches.all)

object Metrics {
  val all: Seq[Metric] = ContentApiMetrics.all ++ CommonMetrics.all
}

object Management extends Management {
  val applicationName = "frontend-article"

  lazy val pages = List(
    new ManifestPage,
    new UrlPagesHealthcheckManagementPage(
      "/world/2012/sep/11/barcelona-march-catalan-independence",
      "/sport/2012/nov/17/becky-james-jess-varnish-rio-olympics"
    ),
    StatusPage(applicationName, Metrics.all),
    new PropertiesPage(Configuration.toString),
    new LogbackLevelPage(applicationName)
  )
}
