package conf

import com.gu.management.logback.LogbackLevelPage
import com.gu.management.play.{Management => GuManagement}
import com.gu.management.{PropertiesPage, StatusPage, ManifestPage}
import common.Metrics

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
