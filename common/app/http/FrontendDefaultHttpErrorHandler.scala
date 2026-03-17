package http

import model.Cors
import play.api.{Environment, Logger, Mode, Configuration => PlayConfiguration}
import play.api.http.Status._
import play.api.http.DefaultHttpErrorHandler
import play.api.mvc.{RequestHeader, Result, Results}
import play.api.routing.Router
import play.core.SourceMapper

import scala.concurrent.{ExecutionContext, Future}
import scala.util.Random

class FrontendDefaultHttpErrorHandler(
    environment: Environment,
    configuration: PlayConfiguration,
    sourceMapper: Option[SourceMapper],
    router: => Router,
)(implicit ec: ExecutionContext)
    extends DefaultHttpErrorHandler(
      environment = environment,
      configuration = configuration,
      sourceMapper = sourceMapper,
      router = Some(router),
    )
    with Results {

  private val logger = Logger(this.getClass)

  private val varyFields = List("Origin", "Accept")
  private val defaultVaryFields = varyFields.mkString(",")

  override def onServerError(request: RequestHeader, ex: Throwable): Future[Result] = {
    // Overriding onError in Dev can hide helpful Exception messages.
    if (environment.mode == Mode.Dev) {
      super.onServerError(request, ex)
    } else {
      val headers = request.headers
      val vary = headers.get("Vary").fold(defaultVaryFields)(v => (v :: varyFields).mkString(","))

      Future.successful {
        Cors(InternalServerError.withHeaders("Vary" -> vary))(request)
      }
    }
  }

  override def onClientError(request: RequestHeader, statusCode: Int, message: String): Future[Result] =
    statusCode match {
      case BAD_REQUEST =>
        // Sample 1% of 400 errors to warn log for investigation
        if (Random.nextInt(100) == 0) {
          logger.warn(
            s"400 Bad Request: $message, for request: ${request.method} ${request.uri}, with headers: ${request.headers.headers}",
          )
        }
        super.onClientError(request, statusCode, message).map(Cors(_)(request))
      case NOT_FOUND => super.onClientError(request, statusCode, message).map(Cors(_)(request))
      case _         => super.onClientError(request, statusCode, message)
    }
}
