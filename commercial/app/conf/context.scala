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
      "/commercial/soulmates/mixed.json",
      "/commercial/masterclasses.json",
      "/commercial/travel/offers.json?k=france",
      "/commercial/jobs.json?s=law"
    ),
    StatusPage(applicationName, metrics),
    new PropertiesPage(Configuration.toString()),
    new LogbackLevelPage(applicationName)
  )
}
