import app.{FrontendApplicationLoader, FrontendComponents, LifecycleComponent}
import com.softwaremill.macwire._
import conf.{CachedHealthCheckLifeCycle, StandaloneFilters}
import contentapi.ContentApiClient
import controllers.{TrainingHttp, HealthCheck, StandaloneControllerComponents}
import model.ApplicationIdentity
import play.api.ApplicationLoader.Context
import play.api._
import play.api.libs.ws.WSClient
import play.api.mvc.EssentialFilter
import play.api.routing.Router
import router.Routes

class AppLoader extends FrontendApplicationLoader {
  override def buildComponents(context: Context): FrontendComponents = new BuiltInComponentsFromContext(context) with AppComponents
}

trait Controllers {
  def wsClient: WSClient
  lazy val healthCheck = wire[HealthCheck]
  ContentApiClient.setHttp(wire[TrainingHttp]) // adds auth as a side effect - can be fixed when ContentApiClient uses DI instead of setHttp
}

trait AppComponents
  extends FrontendComponents
  with StandaloneControllerComponents
  with Controllers
  with StandaloneLifecycleComponents
  with AdminJobsServices {

  lazy val standaloneRoutes: standalone.Routes = wire[standalone.Routes]

  override def router: Router = wire[Routes]
  override def appIdentity: ApplicationIdentity = ApplicationIdentity("training-preview")

  override def lifecycleComponents: List[LifecycleComponent] = standaloneLifecycleComponents :+ wire[CachedHealthCheckLifeCycle]

  override lazy val httpFilters: Seq[EssentialFilter] = wire[StandaloneFilters].filters
}
