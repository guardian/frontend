import app.{FrontendApplicationLoader, FrontendComponents, LifecycleComponent}
import com.softwaremill.macwire._
import conf.CachedHealthCheckLifeCycle
import contentapi.{CapiHttpClient, ContentApiClient, HttpClient}
import controllers.{HealthCheck, ResponsiveViewerController, StandaloneControllerComponents}
import http.StandaloneFilters
import model.ApplicationIdentity
import play.api.ApplicationLoader.Context
import play.api.BuiltInComponentsFromContext
import play.api.http.HttpErrorHandler
import play.api.mvc.EssentialFilter
import play.api.routing.Router
import router.Routes
import services.OphanApi

class AppLoader extends FrontendApplicationLoader {
  override def buildComponents(context: Context): FrontendComponents = new BuiltInComponentsFromContext(context) with AppComponents
}

trait AppComponents
  extends FrontendComponents
  with StandaloneControllerComponents
  with StandaloneLifecycleComponents
  with AdminJobsServices
  with OnwardServices
  with ApplicationsServices {

  override lazy val capiHttpClient: HttpClient = wire[CapiHttpClient]
  override lazy val contentApiClient = wire[ContentApiClient]
  override lazy val ophanApi = wire[OphanApi]

  lazy val healthCheck = wire[HealthCheck]
  lazy val responsiveViewerController = wire[ResponsiveViewerController]

  lazy val standaloneRoutes: standalone.Routes = wire[standalone.Routes]

  override def router: Router = wire[Routes]
  override def appIdentity: ApplicationIdentity = ApplicationIdentity("preview")

  override def lifecycleComponents: List[LifecycleComponent] = standaloneLifecycleComponents :+ wire[CachedHealthCheckLifeCycle]

  override lazy val httpFilters: Seq[EssentialFilter] = wire[StandaloneFilters].filters
  override lazy val httpErrorHandler: HttpErrorHandler = wire[PreviewErrorHandler]
}
