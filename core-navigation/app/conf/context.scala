package conf

import common.Metrics
import com.gu.management.{ PropertiesPage, StatusPage, ManifestPage }
import com.gu.management.play.{ Management => GuManagement }
import com.gu.management.logback.LogbackLevelPage
import play.api.{ Application => PlayApp }

class SwitchBoardPlugin(app: PlayApp) extends SwitchBoardAgent(Configuration)

object Management extends GuManagement {
  val applicationName = "frontend-core-navigation"
  val metrics = Metrics.contentApi ++ Metrics.common

  lazy val pages = List(
    new ManifestPage,
    new UrlPagesHealthcheckManagementPage(
      "/top-stories?callback=navigation",
      "/most-read/society.json?callback=showMostPopular",
      "/related/theobserver/2012/nov/18/the-big-issue-cyclists-versus-motorists?callback=showRelated"
    ),
    StatusPage(applicationName, metrics),
    new PropertiesPage(Configuration.toString),
    new LogbackLevelPage(applicationName)
  )
}
