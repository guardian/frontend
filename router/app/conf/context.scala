package conf

import com.gu.management.{ Manifest => ManifestFile }
import com.gu.management.play.{ Management => GuManagement }

import com.gu.management._
import com.gu.management.play.{ Management => GuManagement }
import com.gu.management.logback.LogbackLevelPage

object ManifestData {
  lazy val build = ManifestFile.asKeyValuePairs.getOrElse("Build", "DEV").replace("\"", "")
}

object Management extends GuManagement {
  val applicationName = "frontend-router"

  lazy val pages = List(
    new ManifestPage,
    new UrlPagesHealthcheckManagementPage(
      "/uk",
      "/sport/2012/sep/23/world-road-race-championship-gilbert-cavendish",
      "/football"
    ) { override val base = "http://localhost" },
    new LogbackLevelPage(applicationName)
  )
}
