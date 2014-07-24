package conf

import common.Metrics
import com.gu.management.{ PropertiesPage, StatusPage, ManifestPage }
import com.gu.management.play.{ Management => GuManagement }
import com.gu.management.logback.LogbackLevelPage

object HealthCheck extends AllGoodHealthcheckController(
  "/top-stories.json?callback=navigation",
  "/most-read/society.json?callback=showMostPopular",
  "/related/theobserver/2012/nov/18/the-big-issue-cyclists-versus-motorists.json?callback=showRelated"
)

object Management extends GuManagement {
  val applicationName = "frontend-onward"
  val metrics = Metrics.common

  lazy val pages = List(
    new ManifestPage,
    new UrlPagesHealthcheckManagementPage(
      "/top-stories.json?callback=navigation",
      "/most-read/society.json?callback=showMostPopular",
      "/related/theobserver/2012/nov/18/the-big-issue-cyclists-versus-motorists.json?callback=showRelated"
    ),
    StatusPage(applicationName, metrics),
    new PropertiesPage(Configuration.toString),
    new LogbackLevelPage(applicationName)
  )
}
