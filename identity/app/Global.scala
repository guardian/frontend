import com.google.inject.Guice
import conf.{TestModule, DevModule, RequestMeasurementMetrics, ProdModule}
import filters.HeaderLoggingFilter
import play.api.Play.current
import play.api._
import play.api.mvc._
import play.api.mvc.Results._
import utils.SafeLogging

object Global extends WithFilters(HeaderLoggingFilter :: RequestMeasurementMetrics.asFilters: _*) with SafeLogging {
  private lazy val injector = {
    val module =
      Play.mode match {
        case Mode.Dev => new DevModule
        case Mode.Prod => new ProdModule
        case Mode.Test => new TestModule
      }

    Guice.createInjector(module)
  }

  override def getControllerInstance[A](clazz: Class[A]) = {
    injector.getInstance(clazz)
  }

  override def onError(request: RequestHeader, ex: Throwable) = {
    logger.error("Serving error page", ex)
    if (Play.mode == Mode.Prod) {
      InternalServerError(
        views.html.errors._50x()
      )
    } else {
      super.onError(request, ex)
    }
  }

  override def onHandlerNotFound(request: RequestHeader): Result = {
    logger.info(s"Serving 404, no handler found for ${request.path}")
    if (Play.mode == Mode.Prod) {
      NotFound(
        views.html.errors._404()
      )
    } else {
      super.onHandlerNotFound(request)
    }
  }

  override def onBadRequest(request: RequestHeader, error: String) = {
    logger.info(s"Serving 400, could not bind request to handler for ${request.uri}")
    if (Play.mode == Mode.Prod) {
      BadRequest("Bad Request: " + error)
    } else {
      super.onBadRequest(request, error)
    }
  }
}
