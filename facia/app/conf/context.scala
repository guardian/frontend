package conf

import common.Metrics
import com.gu.management.{ PropertiesPage, StatusPage, ManifestPage }
import com.gu.management.play.{ Management => GuManagement }
import com.gu.management.logback.LogbackLevelPage
import play.api.{ Application => PlayApp }

class SwitchBoardPlugin(app: PlayApp) extends SwitchBoardAgent(Configuration)

object Management extends GuManagement {
  val applicationName = "frontend-facia"
  val metrics = Metrics.facia ++ Metrics.contentApi ++ Metrics.common ++ Metrics.front

  lazy val pages = List(
    new ManifestPage,
    new UrlPagesHealthcheckManagementPage("/"),
    StatusPage(applicationName, metrics),
    new PropertiesPage(Configuration.toString),
    new LogbackLevelPage(applicationName)
  )
}