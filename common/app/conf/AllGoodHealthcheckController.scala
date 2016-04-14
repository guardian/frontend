package conf

import java.util.concurrent.atomic.AtomicBoolean

import common.ExecutionContexts
import play.api.{Mode, Play}
import play.api.libs.ws.WS
import play.api.mvc._

import scala.concurrent.Future

trait HealthcheckController extends Controller with Results with ExecutionContexts {
  import play.api.Play.current

  def testPort: Int

  lazy val port = {
    Play.current.mode match {
      case Mode.Test => testPort
      case _ => 9000
    }
  }

  lazy val baseUrl = s"http://localhost:$port"

  def healthcheck(): Action[AnyContent]

  protected def fetchResult(path: String): Future[(String, Int)] = WS.url(s"$baseUrl$path")
    .withHeaders("X-Gu-Management-Healthcheck" -> "true")
    .withRequestTimeout(10000).get()
    .map(result => (s"$baseUrl$path", result.status))

  protected def fetchResults(paths: String*): Seq[Future[(String, Int)]] = paths.map(fetchResult)

}

// expects ALL of the paths to return 200. If one fails the entire healthcheck fails
class AllGoodHealthcheckController(override val testPort: Int, paths: String*) extends HealthcheckController {

  // this is for an "offline" healthcheck that the CDN hits
  protected val status = new AtomicBoolean(false)
  def break() = status.set(false)
  def isOk = status.get

  override def healthcheck() = Action.async{

    val healthCheckResults = fetchResults(paths:_*)

    Future.sequence(healthCheckResults)
      .map(_.filterNot { case (_, status) => status == 200})
      .map(_.toList)
      .map {
        case Nil => {
          status.set(true)
          Ok("OK")
        }
        case errors => {
          status.set(false)
          InternalServerError(errors.map { case (url, status) => s"$status $url"}.mkString("\n"))
        }
      }
  }
}

// expects ONE of the paths to return 200. If one passes the entire healthcheck passes regardless of other failures
class AnyGoodHealthcheckController(override val testPort: Int, paths: String*) extends HealthcheckController {
  override def healthcheck() = Action.async{

    val firstHealthyEndpoint = Future.find(fetchResults(paths: _*)) {
      case (_, status) => status == 200
    }

    firstHealthyEndpoint map {
      _ map { _ =>
        Ok("OK")
      } getOrElse {
        InternalServerError(s"None of these endpoints is healthy:\n${paths.mkString("\n")}")
      }
    }
  }
}
