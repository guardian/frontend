import app.{FrontendComponents, FrontendApplicationLoader}
import com.softwaremill.macwire._
import common.LifecycleComponent
import conf.{StandaloneFilters, CachedHealthCheckLifeCycle}
import controllers.{StandaloneControllerComponents, HealthCheck}
import model.ApplicationIdentity
import play.api.ApplicationLoader.Context
import play.api._
import play.api.mvc.EssentialFilter
import play.api.routing.Router
import router.Routes

class AppLoader extends FrontendApplicationLoader {
  override def buildComponents(context: Context): FrontendComponents = new BuiltInComponentsFromContext(context) with AppComponents
}

trait Controllers {
  lazy val healthCheck = wire[HealthCheck]
}

trait AppComponents extends FrontendComponents with StandaloneControllerComponents with Controllers with StandaloneLifecycleComponents {

  lazy val standaloneRoutes: standalone.Routes = wire[standalone.Routes]

  override def router: Router = wire[Routes]
  override def appIdentity: ApplicationIdentity = ApplicationIdentity("training-preview")

  override def lifecycleComponents: List[LifecycleComponent] = standaloneLifecycleComponents :+ wire[CachedHealthCheckLifeCycle]

  override lazy val httpFilters: Seq[EssentialFilter] = wire[StandaloneFilters].filters
}
