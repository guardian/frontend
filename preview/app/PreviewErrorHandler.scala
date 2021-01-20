import com.gu.contentapi.client.model.ContentApiError
import play.api._
import play.api.http.DefaultHttpErrorHandler
import play.api.mvc.Results._
import play.api.mvc._
import play.api.routing.Router
import play.core.SourceMapper

import scala.concurrent._

class PreviewErrorHandler(
    env: Environment,
    config: Configuration,
    sourceMapper: Option[SourceMapper],
    router: => Router,
) extends DefaultHttpErrorHandler(env, config, sourceMapper, Some(router)) {

  override def onServerError(request: RequestHeader, exception: Throwable): Future[Result] = {
    exception match {
      case ContentApiError(statusCode, statusMessage, _) if statusCode == 404 =>
        Future.successful(NotFound(views.html.not_found(request.path)))
      case _ =>
        super.onServerError(request, exception)
    }
  }

}
