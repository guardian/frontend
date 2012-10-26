package conf

import common._
import com.gu.management.{ Manifest => ManifestFile }
import com.gu.management._
import com.gu.management.logback.LogbackLevelPage

object Configuration extends BaseGuardianConfiguration("frontend-diagnostics")

object Management extends com.gu.management.play.Management {
  val applicationName = Configuration.application

  lazy val pages = List(
    new ManifestPage,
    new UrlPagesHealthcheckManagementPage(Configuration.healthcheck.urls.toList),
    new PropertiesPage(Configuration.toString),
    new LogbackLevelPage(applicationName)
  )
}
