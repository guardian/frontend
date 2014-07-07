package conf

import common.Metrics
import com.gu.management.{PropertiesPage, StatusPage, ManifestPage}
import com.gu.management.play.{Management => GuManagement}
import com.gu.management.logback.LogbackLevelPage

object Management extends GuManagement {
  val applicationName = "frontend-facia-press"

  val metrics = Metrics.faciaPress

  /** TODO add healthcheck */
  lazy val pages = List(
    new ManifestPage,
    StatusPage(applicationName, metrics),
    new PropertiesPage(Configuration.toString),
    new LogbackLevelPage(applicationName)
  )
}
