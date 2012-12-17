package conf

import common._
import com.gu.management._
import com.gu.management.logback.LogbackLevelPage
import metrics._

object Management extends com.gu.management.play.Management {
  val applicationName = "frontend-diagnostics"

  lazy val pages = List(
    new ManifestPage,
    new UrlPagesHealthcheckManagementPage("/px.gif") { override val base = "http://localhost" },
    StatusPage(applicationName, NginxLog.metrics),
    new PropertiesPage(Configuration.toString),
    new LogbackLevelPage(applicationName)
  )
}
