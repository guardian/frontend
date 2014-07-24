package conf

import com.gu.management._
import com.gu.management.play.{ Management => GuManagement }
import com.gu.management.logback.LogbackLevelPage

object HealthCheck extends AllGoodHealthcheckController("/signin")

object Management extends GuManagement {
  val applicationName = "frontend-identity"

  lazy val pages = List(
    new ManifestPage,
    new UrlPagesHealthcheckManagementPage("/signin"),
    new LogbackLevelPage(applicationName)
  )
}
