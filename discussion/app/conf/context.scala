package conf

import common.Metrics
import com.gu.management.{ PropertiesPage, StatusPage, ManifestPage }
import com.gu.management.play.{ Management => GuManagement }
import com.gu.management.logback.LogbackLevelPage
import play.api.{Mode, Play}

object HealthCheck extends AllGoodHealthcheckController("/discussion/p/37v3a") {
  val testPort = 9007

  override lazy val port = {
    Play.current.mode match {
      case Mode.Test => testPort
      case _ => 9000
    }
  }
}

object Management extends GuManagement {
  val applicationName = "frontend-discussion"
  val metrics = Metrics.contentApi ++ Metrics.common ++ Metrics.discussion

  lazy val pages = List(
    new ManifestPage,
    new UrlPagesHealthcheckManagementPage(
      "/discussion/p/37v3a"
    ),
    StatusPage(applicationName, metrics),
    new PropertiesPage(Configuration.toString),
    new LogbackLevelPage(applicationName)
  )
}
