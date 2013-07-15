package conf

import com.gu.management._
import com.gu.management.play.{ Management => GuManagement }
import com.gu.management.logback.LogbackLevelPage

object Management extends GuManagement {
  val applicationName = "frontend-identity"

  lazy val pages = List(
    new ManifestPage,
    new ManagementPage {
      val path: String = "/management/healthcheck"
      def get(req: HttpRequest): Response = PlainTextResponse("OK")
    },
    new LogbackLevelPage(applicationName)
  )
}
