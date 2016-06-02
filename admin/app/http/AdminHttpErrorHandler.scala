package http

import com.google.inject.{Inject, Provider}
import play.api.http.DefaultHttpErrorHandler
import play.api.mvc.{RequestHeader, Result, Results}
import play.api.routing.Router
import play.api.{Configuration, Environment, OptionalSourceMapper}

import scala.concurrent.Future

class AdminHttpErrorHandler @Inject() (
  env: Environment,
  config: Configuration,
  sourceMapper: OptionalSourceMapper,
  router: Provider[Router]) extends DefaultHttpErrorHandler(env, config, sourceMapper, router) with Results {

  override def onServerError(request: RequestHeader, exception: Throwable): Future[Result] = Future.successful(
    InternalServerError(views.html.errorPage(exception))
  )
}
