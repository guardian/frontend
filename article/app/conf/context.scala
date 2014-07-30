package conf

import _root_.play.api.{Mode, Play}
import _root_.play.api.mvc.{Results, Action}
import play.api.libs.ws.WS
import common.Metrics
import com.gu.management.play.{ Management => GuManagement }
import com.gu.management.logback.LogbackLevelPage
import scala.concurrent.{ExecutionContext, Await, Future}
import com.gu.management._
import scala.concurrent.duration._
import java.util.concurrent.atomic.AtomicBoolean


object HealthCheck extends AllGoodHealthcheckController("/world/2012/sep/11/barcelona-march-catalan-independence") with Results {

  // this is for an "offline" healthcheck that the CDN hits
  private val status = new AtomicBoolean(false)
  def break() = status.set(false)

  override def healthcheck() = Action.async{ request =>
    val result = super.healthcheck()(request)
    result.foreach(r => status.set(r.header.status == 200))
    result
  }

  val testPort = 9004

  override lazy val port = {
    Play.current.mode match {
      case Mode.Test => testPort
      case _ => 9000
    }
  }

  def isOk = status.get
}

class HealthcheckPage(urls: String*) extends UrlPagesHealthcheckManagementPage(urls:_*) {

  import ExecutionContext.Implicits.global

  private lazy val status = new AtomicBoolean(false)

  def break() = status.set(false)

  override def get(req: HttpRequest) = {
    import _root_.play.api.Play.current
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

object HealthcheckPage extends HealthcheckPage("/world/2012/sep/11/barcelona-march-catalan-independence")

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