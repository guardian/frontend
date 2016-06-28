import com.gu.contentapi.client.GuardianContentApiError
import play.api._
import play.api.http.DefaultHttpErrorHandler
import play.api.mvc.Results._
import play.api.mvc._
import play.core.SourceMapper

import scala.concurrent._

class PreviewErrorHandler(
    env: Environment,
    config: Configuration,
    sourceMapper: Option[SourceMapper]
  ) extends DefaultHttpErrorHandler(env, config, sourceMapper, None) {

  override def onServerError(request: RequestHeader, exception: Throwable) = {
    exception match  {
      case GuardianContentApiError(statusCode, statusMessage, _) if statusCode == 404 =>
        Future.successful(NotFound(views.html.not_found(request.path)))
      case _ =>
        super.onServerError(request, exception)
    }
  }

}
