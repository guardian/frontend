package conf

import com.gu.management.play.{ Management => GuManagement }
import com.gu.management.logback.LogbackLevelPage
import com.gu.management.ManifestPage

object HealthCheck extends AllGoodHealthcheckController("/ab.gif")

object Management extends GuManagement {
  val applicationName = "frontend-diagnostics"

  lazy val pages = List(
    new ManifestPage,
    new UrlPagesHealthcheckManagementPage("/ab.gif"),
    new LogbackLevelPage(applicationName)
  )
}
