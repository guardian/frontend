package controllers

import play.api.mvc.{Action, Controller}
import scala.concurrent.Future
import play.api.libs.ws.WS
import scala.concurrent.ExecutionContext.Implicits.global
import grizzled.slf4j.Logging

object HealthCheckCase {
  def all = Seq(
    HealthCheckCase("static", "sys-images/Guardian/Pix/pictures/2014/3/13/1394733749150/SimonJenkins.png"),
    HealthCheckCase("sport", "football/crests/26388.png")
  )
}

case class HealthCheckCase(backend: String, path: String)

object HealthCheck extends Controller with Logging {
  def healthCheck = Action.async { request =>
    def checkHealth(healthCheckCase: HealthCheckCase): Future[Unit] = {
      val url = "http://" + request.host + routes.Resizer.resize(healthCheckCase.backend, healthCheckCase.path, 4, 60)
      WS.url(url).get() map { _.status match {
          case OK => ()
          case statusCode =>
            throw new RuntimeException(s"Got $statusCode trying to resize image from ${healthCheckCase.backend}")
        }
      }
    }

    Future.sequence(HealthCheckCase.all map checkHealth).map(_ => Ok("Everything's cool")) recover {
      case error =>
        logger.error("Health check failed", error)
        ServiceUnavailable(error.getMessage)
    }
  }
}
