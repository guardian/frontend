package http

import play.api.http.DefaultHttpErrorHandler
import play.api.http.Status._
import play.api.mvc.{RequestHeader, Result, Results}
import play.api._
import play.api.routing.Router
import play.core.SourceMapper
import utils.SafeLogging

import scala.concurrent.Future

class IdentityHttpErrorHandler(
    config: Configuration,
    sourceMapper: Option[SourceMapper],
    environment: Environment,
    router: => Router,
) extends DefaultHttpErrorHandler(environment, config, sourceMapper, Some(router))
    with Results
    with SafeLogging {

  override def onServerError(request: RequestHeader, exception: Throwable): Future[Result] = {
    logger.error("Serving error page", exception)
    if (environment.mode == Mode.Prod) {
      Future.successful(InternalServerError(views.html.errors._50x()))
    } else {
      super.onServerError(request, exception)
    }
  }

  override def onClientError(request: RequestHeader, statusCode: Int, message: String): Future[Result] = {
    def notFound = {
      logger.info(s"Serving 404, no handler found for ${request.path}")
      if (environment.mode == Mode.Prod) {
        Future.successful(NotFound(views.html.errors._404()))
      } else {
        super.onClientError(request, statusCode, message)
      }
    }

    def badRequest = {
      logger.info(s"Serving 400, could not bind request to handler for ${request.uri}")
      if (environment.mode == Mode.Prod) {
        Future.successful(BadRequest("Bad Request: " + message))
      } else {
        super.onClientError(request, statusCode, message)
      }
    }

    statusCode match {
      case NOT_FOUND   => notFound
      case BAD_REQUEST => badRequest
      case _           => super.onClientError(request, statusCode, message)
    }
  }
}
