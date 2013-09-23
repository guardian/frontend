import com.google.inject.Guice
import conf.{TestModule, DevModule, RequestMeasurementMetrics, ProdModule}
import filters.HeaderLoggingFilter
import play.api.mvc.WithFilters
import play.api.{Mode, Play}
import play.api.Play.current

object Global extends WithFilters(HeaderLoggingFilter :: RequestMeasurementMetrics.asFilters: _*) {
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
}
