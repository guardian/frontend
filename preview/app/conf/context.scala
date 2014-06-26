package conf

import _root_.play.api.libs.ws.WS
import common.Metrics
import com.gu.management._
import com.gu.management.play.{ Management => GuManagement }
import com.gu.management.logback.LogbackLevelPage
import scala.concurrent.{ExecutionContext, Await, Future}
import com.gu.management.HttpRequest
import com.gu.management.PlainTextResponse
import scala.concurrent.duration._
import java.util.concurrent.atomic.AtomicBoolean

class HealthcheckPage(urls: String*) extends UrlPagesHealthcheckManagementPage(urls:_*) {

  import ExecutionContext.Implicits.global

  private lazy val status = new AtomicBoolean(false)


  override def get(req: HttpRequest) = {
    def fetch(url: String) = WS.url(url).withHeaders("X-Gu-Management-Healthcheck" -> "true").get()

    val checks = urls map { base + _ } map { url => fetch(url).map{ response => url -> response } }
    val sequenced = Future.sequence(checks)
    val failed = sequenced map { _ filter { _._2.status / 100 != 2 } }

    Await.result(failed, 10 -> SECONDS) match {
      case Nil =>
        status.set(true)
        PlainTextResponse("OK")

      case failures =>
        status.set(false)
        val message = failures map { case (url, response) => s"FAIL: $url (${response.status}})" }
        ErrorResponse(503, message mkString "\n")
    }
  }

  def isOk = status.get
}

object HealthcheckPage extends HealthcheckPage("/world/2012/sep/11/barcelona-march-catalan-independence") {

  // the previwe server has an nginx running on port 80
  override val base = "http://localhost"
}


object Management extends GuManagement {
  val applicationName = "frontend-article"
  val metrics = Metrics.contentApi ++ Metrics.common

  lazy val pages = List(
    new ManifestPage,
    HealthcheckPage,
    StatusPage(applicationName, metrics),
    new PropertiesPage(Configuration.toString),
    new LogbackLevelPage(applicationName)
  )
}