package conf

import common.Metrics
import com.gu.management.{ PropertiesPage, StatusPage, ManifestPage }
import com.gu.management.play.{ Management => GuManagement }
import com.gu.management.logback.LogbackLevelPage
import play.api.{ Application => PlayApp }

class SwitchBoardPlugin(app: PlayApp) extends SwitchBoardAgent(Configuration, Switches.all)

object Management extends GuManagement {
  val applicationName = "frontend-style-guide"
  val metrics = Metrics.contentApi ++ Metrics.common

  lazy val pages = List(
    new ManifestPage,
    new UrlPagesHealthcheckManagementPage(
      "/style-guide"
    ),
    StatusPage(applicationName, metrics),
    new PropertiesPage(Configuration.toString),
    new LogbackLevelPage(applicationName)
  )
}