import com.google.inject.Guice
import common.CloudWatchApplicationMetrics
import conf._
import filters.{StrictTransportSecurityHeaderFilter, HeaderLoggingFilter}
import play.api.Play.current
import play.api._
import play.api.mvc._
import play.api.mvc.Results._
import play.api.inject._
import play.api.inject.guice._
import scala.concurrent.Future
import utils.SafeLogging

object Global extends WithFilters(HeaderLoggingFilter :: StrictTransportSecurityHeaderFilter :: conf.Filters.common: _*)
  with SafeLogging
  with CloudWatchApplicationMetrics
  with IdentityLifecycle
  with SwitchboardLifecycle {

  override lazy val applicationName = "frontend-identity"

  override def onError(request: RequestHeader, ex: Throwable) = {
    logger.error("Serving error page", ex)
    if (Play.mode == Mode.Prod) {
      Future.successful(InternalServerError(views.html.errors._50x()))
    } else {
      super.onError(request, ex)
    }
  }

  override def onHandlerNotFound(request: RequestHeader) = {
    logger.info(s"Serving 404, no handler found for ${request.path}")
    if (Play.mode == Mode.Prod) {
      Future.successful(NotFound(views.html.errors._404()))
    } else {
      super.onHandlerNotFound(request)
    }
  }

  override def onBadRequest(request: RequestHeader, error: String) = {
    logger.info(s"Serving 400, could not bind request to handler for ${request.uri}")
    if (Play.mode == Mode.Prod) {
      Future.successful(BadRequest("Bad Request: " + error))
    } else {
      super.onBadRequest(request, error)
    }
  }
}

class IdentityApplicationLoader extends GuiceApplicationLoader() {

  override def builder(context: ApplicationLoader.Context): GuiceApplicationBuilder = {
    val module = context.environment.mode match {
      case Mode.Prod => {
        if (conf.Configuration.environment.isNonProd) new PreProdModule
        else new ProdModule
      }
      case Mode.Dev => new DevModule
      case Mode.Test => new TestModule
    }
    new GuiceApplicationBuilder()
      .in(context.environment)
      .loadConfig(context.initialConfiguration)
      .bindings(module)
  }
}
