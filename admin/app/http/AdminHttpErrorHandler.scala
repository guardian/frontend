package http

import play.api.http.DefaultHttpErrorHandler
import play.api.mvc.{RequestHeader, Result, Results}
import play.api.routing.Router
import play.api.{Configuration, Environment}
import play.core.SourceMapper

import scala.concurrent.Future

class AdminHttpErrorHandler(
    env: Environment,
    config: Configuration,
    sourceMapper: Option[SourceMapper],
    router: => Router,
) extends DefaultHttpErrorHandler(env, config, sourceMapper, Some(router))
    with Results {

  override def onServerError(request: RequestHeader, exception: Throwable): Future[Result] =
    Future.successful(
      InternalServerError(views.html.errorPage(exception)),
    )
}
