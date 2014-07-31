package conf

import play.api.{Mode, Play}
import com.gu.management.ManifestPage
import com.gu.management.play.{Management => GuManagement}
import com.gu.management.logback.LogbackLevelPage

object HealthCheck extends AllGoodHealthcheckController(9010, "/signin")

object Management extends GuManagement {
  val applicationName = "frontend-identity"

  lazy val pages = List(
    new ManifestPage,
    new UrlPagesHealthcheckManagementPage("/signin"),
    new LogbackLevelPage(applicationName)
  )
}
