package conf

import common.Metrics
import com.gu.management.{PropertiesPage, StatusPage, ManifestPage}
import com.gu.management.play.{Management => GuManagement}
import com.gu.management.logback.LogbackLevelPage

object Management extends GuManagement {
  val applicationName = "frontend-commercial"
  val metrics = Metrics.contentApi ++ Metrics.common

  lazy val pages = List(
    new ManifestPage,
    new UrlPagesHealthcheckManagementPage("/commercial/masterclasses.json"),
    StatusPage(applicationName, metrics),
    new PropertiesPage(Configuration.toString()),
    new LogbackLevelPage(applicationName)
  )
}
