import javax.inject._

import com.gu.contentapi.client.GuardianContentApiError
import play.api._
import play.api.http.DefaultHttpErrorHandler
import play.api.mvc.Results._
import play.api.mvc._
import play.api.routing.Router

import scala.concurrent._

class PreviewErrorHandler @Inject() (
    env: Environment,
    config: Configuration,
    sourceMapper: OptionalSourceMapper,
    router: Provider[Router]
  ) extends DefaultHttpErrorHandler(env, config, sourceMapper, router) {

  override def onServerError(request: RequestHeader, exception: Throwable) = {
    exception match  {
      case GuardianContentApiError(statusCode, statusMessage, _) if statusCode == 404 =>
        Future.successful(NotFound(views.html.not_found(request.path)))
      case _ =>
        super.onServerError(request, exception)
    }
  }

}
