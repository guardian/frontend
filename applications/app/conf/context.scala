package conf

import common.Metrics
import com.gu.management.{ PropertiesPage, StatusPage, ManifestPage }
import com.gu.management.play.{ Management => GuManagement }
import com.gu.management.logback.LogbackLevelPage

object Management extends GuManagement {
  val applicationName = "frontend-applications"
  val metrics = Metrics.contentApi ++ Metrics.common

  lazy val pages = List(
    new ManifestPage,
    new UrlPagesHealthcheckManagementPage(
      "/books",
      "/books/harrypotter",
      "/travel/gallery/2012/nov/20/st-petersburg-pushkin-museum",
      "/travel/gallery/2012/nov/20/st-petersburg-pushkin-museum?index=2",
      "/world/video/2012/nov/20/australian-fake-bomber-sentenced-sydney-teenager-video"
    ),
    StatusPage(applicationName, metrics),
    new PropertiesPage(Configuration.toString),
    new LogbackLevelPage(applicationName)
  )
}
