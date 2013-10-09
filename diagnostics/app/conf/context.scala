package conf

import com.gu.management._
import com.gu.management.play.{ Management => GuManagement }
import com.gu.management.logback.LogbackLevelPage
import metrics.NginxLog

object Management extends GuManagement {
  val applicationName = "frontend-diagnostics"

  lazy val pages = List(
    new ManifestPage,
    new UrlPagesHealthcheckManagementPage("/px.gif") { override val base = "http://localhost" },
    StatusPage(applicationName, NginxLog.metrics),
    new LogbackLevelPage(applicationName)
  )
}
