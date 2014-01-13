package conf

import com.gu.management.play.{ Management => GuManagement }
import com.gu.management.logback.LogbackLevelPage
import com.gu.management.ManifestPage

object Management extends GuManagement {
  val applicationName = "frontend-diagnostics"

  lazy val pages = List(
    new ManifestPage,
    new UrlPagesHealthcheckManagementPage("/px.gif"),
    new LogbackLevelPage(applicationName)
  )
}
