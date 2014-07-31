package conf

import com.gu.management.play.{ Management => GuManagement }
import com.gu.management.logback.LogbackLevelPage
import com.gu.management.ManifestPage
import play.api.{Mode, Play}

object HealthCheck extends AllGoodHealthcheckController("/ab.gif") {
  val testPort = 9006

  override lazy val port = {
    Play.current.mode match {
      case Mode.Test => testPort
      case _ => 9000
    }
  }
}

object Management extends GuManagement {
  val applicationName = "frontend-diagnostics"

  lazy val pages = List(
    new ManifestPage,
    new UrlPagesHealthcheckManagementPage("/ab.gif"),
    new LogbackLevelPage(applicationName)
  )
}
