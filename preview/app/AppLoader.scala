import app.{LifecycleComponent, FrontendComponents, FrontendApplicationLoader}
import com.softwaremill.macwire._
import conf.{StandaloneFilters, CachedHealthCheckLifeCycle}
import controllers.{ResponsiveViewerController, StandaloneControllerComponents, HealthCheck}
import model.ApplicationIdentity
import play.api.ApplicationLoader.Context
import play.api._
import play.api.http.HttpErrorHandler
import play.api.mvc.EssentialFilter
import play.api.routing.Router
import router.Routes

class AppLoader extends FrontendApplicationLoader {
  override def buildComponents(context: Context): FrontendComponents = new BuiltInComponentsFromContext(context) with AppComponents
}

trait Controllers {
  lazy val healthCheck = wire[HealthCheck]
  lazy val responsiveViewerController = wire[ResponsiveViewerController]
}

trait AppComponents extends FrontendComponents with StandaloneControllerComponents with Controllers with StandaloneLifecycleComponents {

  lazy val standaloneRoutes: standalone.Routes = wire[standalone.Routes]

  override def router: Router = wire[Routes]
  override def appIdentity: ApplicationIdentity = ApplicationIdentity("preview")

  override def lifecycleComponents: List[LifecycleComponent] = standaloneLifecycleComponents :+ wire[CachedHealthCheckLifeCycle]

  override lazy val httpFilters: Seq[EssentialFilter] = wire[StandaloneFilters].filters
  override lazy val httpErrorHandler: HttpErrorHandler = wire[PreviewErrorHandler]
}
