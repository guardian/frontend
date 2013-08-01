import com.google.inject.Guice
import conf.{ProdModule, RequestMeasurementMetrics}
import controllers.front.FrontLifecycle
import dev.DevParametersLifecycle
import play.api.mvc.WithFilters

object Global extends WithFilters(RequestMeasurementMetrics.asFilters: _*) with MostPopularLifecycle
  with FrontLifecycle with StoryLifecycle with DevParametersLifecycle {

  private lazy val injector = {
    Guice.createInjector(new ProdModule)
  }

  override def getControllerInstance[A](clazz: Class[A]) = {
    injector.getInstance(clazz)
  }
}
