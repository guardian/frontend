import com.google.inject.Guice
import conf.{RequestMeasurementMetrics, ProdModule}
import play.api.mvc.WithFilters

object Global extends WithFilters(RequestMeasurementMetrics.asFilters: _*) {

  private lazy val injector = {
    Guice.createInjector(new ProdModule)
  }

  override def getControllerInstance[A](clazz: Class[A]) = {
    injector.getInstance(clazz)
  }
}
