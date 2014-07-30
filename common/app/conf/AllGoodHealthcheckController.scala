package conf

import common.ExecutionContexts
import play.api.libs.ws.WS
import play.api.mvc._

import scala.concurrent.Future

trait HealthcheckController extends Controller with Results with ExecutionContexts {
  import play.api.Play.current

  lazy val port = 9000
  lazy val baseUrl = s"http://localhost:$port"

  def healthcheck(): Action[AnyContent]

  protected def fetchResults(paths: String*): Seq[Future[(String, Int)]] = {
    paths.map(path => WS.url(s"$baseUrl$path")
      .withHeaders("X-Gu-Management-Healthcheck" -> "true")
      .withRequestTimeout(10000).get()
      .map(result => (s"$baseUrl$path", result.status)))
  }
}

// expects ALL of the paths to return 200. If one fails the entire healthcheck fails
class AllGoodHealthcheckController(paths: String*) extends HealthcheckController {

  override def healthcheck() = Action.async{

    val healthCheckResults = fetchResults(paths:_*)

    Future.sequence(healthCheckResults).map(_.filterNot { case (_, status) => status == 200})
      .map {
      case Nil => Ok("OK")
      case errors => InternalServerError(errors.map{ case (url, status) => s"$status $url" }.mkString("\n"))
    }
  }
}

// expects ONE of the paths to return 200. If one passes the entire healthcheck passes regardless of other failures
class AnyGoodHealthcheckController(paths: String*) extends HealthcheckController {
  override def healthcheck() = Action.async{

    val healthCheckResults = fetchResults(paths:_*)

    Future.sequence(healthCheckResults).map(_.filterNot { case (_, status) => status == 200})
      .map {
      case Nil => Ok("OK")
      case errors if errors.size < paths.size => Ok(errors.map{ case (url, status) => s"$status $url" }.mkString("\n"))
      case errors => InternalServerError(errors.map{ case (url, status) => s"$status $url" }.mkString("\n"))
    }
  }
}

