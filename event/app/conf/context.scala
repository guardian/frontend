package conf

import play.api.{ Application => PlayApp }
import common._
import com.gu.management.{ PropertiesPage, StatusPage, ManifestPage, Switchable, Metric }
import com.gu.management.play.{ Management => GuManagement }

import com.gu.management.logback.LogbackLevelPage

object Switches {
  val all: Seq[Switchable] = CommonSwitches.all
}

class SwitchBoardPlugin(app: PlayApp) extends SwitchBoardAgent(Configuration, Switches.all)

object Metrics {
  val all: Seq[Metric] = ContentApi.metrics.all ++ CommonMetrics.all
}

object Management extends GuManagement {
  val applicationName = "frontend-event"

  lazy val pages = List(
    new ManifestPage,
    new UrlPagesHealthcheckManagementPage(
      "/event/all?callback=event"
    ),
    StatusPage(applicationName, Metrics.all),
    new PropertiesPage(Configuration.toString),
    new LogbackLevelPage(applicationName)
  )
}
