package conf

import com.gu.management.{JsonResponse, ManagementPage, ErrorResponse, HttpRequest}
import net.liftweb.json.JsonDSL._
import play.api.libs.ws.WS
import scala.concurrent.duration._
import scala.concurrent.{Await, Future}

/*
 * App is considered healthy if any of the given URLs is OK.
 */
class AnyOfTheGivenUrlsHealthCheckManagementPage(urls: String*) extends ManagementPage {

  import play.api.libs.concurrent.Execution.Implicits.defaultContext

  override val path = "/management/healthcheck"

  val base = "http://localhost:9000"

  override def get(req: HttpRequest) = {
    val checks = urls map (base + _) map {
      url => WS.url(url).get().map {
        response => url -> response.status
      }
    }
    val sequenced = Future.sequence(checks)

    Await.result(sequenced, atMost = 10.seconds) match {

      case results if results.exists(_._2 == 200) =>
        val resultMap = results.map { case (checkedUrl, status) => checkedUrl -> status}.toMap
        JsonResponse(resultMap)

      case results =>
        val message = results map {
          case (u, status) => s"FAIL: $u ($status)"
        }
        ErrorResponse(503, message mkString "\n")
    }
  }
}
