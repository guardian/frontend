package conf

import com.gu.management.logback.LogbackLevelPage
import com.gu.management.play.{Management => GuManagement}
import com.gu.management.{PropertiesPage, StatusPage, ManifestPage}
import common.Metrics
import play.api.{Mode, Play}

object HealthCheck extends AnyGoodHealthcheckController(
  "/commercial/soulmates/mixed.json",
  "/commercial/masterclasses.json",
  "/commercial/travel/offers.json",
  "/commercial/jobs.json",
  "/commercial/money/bestbuys.json",
  "/commercial/books/bestsellers.json"
) {

  val testPort = 9005

  override lazy val port = {
    Play.current.mode match {
      case Mode.Test => testPort
      case _ => 9000
    }
  }
}

object Management extends GuManagement {
  val applicationName = "frontend-commercial"
  val metrics = Metrics.contentApi ++ Metrics.common

  lazy val pages = List(
    new ManifestPage,
    new AnyOfTheGivenUrlsHealthCheckManagementPage(
      "/commercial/soulmates/mixed.json",
      "/commercial/masterclasses.json",
      "/commercial/travel/offers.json",
      "/commercial/jobs.json",
      "/commercial/money/bestbuys.json",
      "/commercial/books/bestsellers.json"
    ),
    StatusPage(applicationName, metrics),
    new PropertiesPage(Configuration.toString()),
    new LogbackLevelPage(applicationName)
  )
}
