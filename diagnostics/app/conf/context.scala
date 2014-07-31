package conf

import com.gu.management.play.{ Management => GuManagement }
import com.gu.management.logback.LogbackLevelPage
import com.gu.management.ManifestPage
import play.api.{Mode, Play}

object HealthCheck extends AllGoodHealthcheckController(9006, "/ab.gif")

object Management extends GuManagement {
  val applicationName = "frontend-diagnostics"

  lazy val pages = List(
    new ManifestPage,
    new UrlPagesHealthcheckManagementPage("/ab.gif"),
    new LogbackLevelPage(applicationName)
  )
}
