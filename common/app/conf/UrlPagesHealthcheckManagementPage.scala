package conf

import scala.concurrent.Await
import common.{ExecutionContexts, Logging}
import play.api.libs.concurrent.Promise
import play.api.libs.ws.WS
import com.gu.management.ManagementPage
import com.gu.management.HttpRequest
import com.gu.management.PlainTextResponse
import com.gu.management.ErrorResponse
import scala.concurrent.duration._

class UrlPagesHealthcheckManagementPage(val urls: String*) extends ManagementPage with Logging with ExecutionContexts {

  val path = "/management/healthcheck"

  val base = "http://localhost:9000"

  def get(req: HttpRequest) = {
    val checks = urls map { base + _ } map { url =>
      log.info(s"Healthcheck: Checking $url")

      // IF this is failing on your local box, then you need to run as ./sbt011 --no-proxy
      WS.url(url).get().map{ response => url -> response }
    }

    val sequenced = Promise.sequence(checks) // List[Promise[...]] -> Promise[List[...]]
    val failed = sequenced map { _ filter { _._2.status / 100 != 2 } }

    Await.result(failed, 10 -> SECONDS) match {
      case Nil =>
        log.info("Healthcheck OK")
        PlainTextResponse("OK")

      case failures =>
        val message = failures map {
          case (url, response) =>
            log.info(s"Healthcheck FAIL: $response (${response.status}})")
            s"FAIL: $url (${response.status}})"
        }
        ErrorResponse(503, message mkString "\n")
    }
  }
}
