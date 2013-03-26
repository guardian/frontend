package conf

import common._
import com.gu.management.{ Manifest => ManifestFile }
import com.gu.management._
import com.gu.management.logback.LogbackLevelPage

object RouterConfiguration extends BaseGuardianConfiguration("frontend-router")

object ManifestData {
  lazy val build = ManifestFile.asKeyValuePairs.getOrElse("Build", "DEV").dequote.trim
}

object Management extends com.gu.management.play.Management {
  val applicationName = "frontend-router"

  lazy val pages = List(
    new ManifestPage,
    new UrlPagesHealthcheckManagementPage(
      "/",
      "/sport/2012/sep/23/world-road-race-championship-gilbert-cavendish",
      "/football"
    ) { override val base = "http://localhost" },
    new PropertiesPage(RouterConfiguration.toString),
    new LogbackLevelPage(applicationName)
  )
}
