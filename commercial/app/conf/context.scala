package conf

import common.Metrics
import com.gu.management.{PropertiesPage, StatusPage, ManifestPage}
import com.gu.management.play.{Management => GuManagement}
import com.gu.management.logback.LogbackLevelPage
import play.api.{Application => PlayApp}

class SwitchBoardPlugin(app: PlayApp) extends SwitchBoardAgent(Configuration)

object Management extends GuManagement {
  val applicationName = "frontend-commercial"
  val metrics = Metrics.contentApi ++ Metrics.common

  lazy val pages = List(
    new ManifestPage,
    new AnyOfTheGivenUrlsHealthCheckManagementPage(
      "/commercial/soulmates/mixed.json?seg=repeat&s=lifeandstyle",
      "/commercial/masterclasses.json?seg=repeat&s=music",
      "/commercial/travel/offers.json?seg=repeat&s=travel&k=france",
      "/commercial/jobs.json?seg=repeat&s=business&k=arts"
    ),
    StatusPage(applicationName, metrics),
    new PropertiesPage(Configuration.toString()),
    new LogbackLevelPage(applicationName)
  )
}
