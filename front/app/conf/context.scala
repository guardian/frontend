package conf

import play.api.{ Application => PlayApp }
import com.gu.management._
import com.gu.management.play._
import logback.LogbackLevelPage
import common._

object Switches {
  val all: Seq[Switchable] = CommonSwitches.all
}

class SwitchBoardPlugin(app: PlayApp) extends SwitchBoardAgent(Configuration, Switches.all)

object Metrics {
  val all: Seq[Metric] = ContentApi.metrics.all ++ CommonMetrics.all
}

object Management extends Management {
  val applicationName = "frontend-front"

  lazy val pages = List(
    new ManifestPage,
    new UrlPagesHealthcheckManagementPage("/"),
    StatusPage(applicationName, Metrics.all),
    new PropertiesPage(Configuration.toString),
    new LogbackLevelPage(applicationName)
  )
}