import org.apache.pekko.actor.{ActorSystem => PekkoActorSystem}
import http.{CommonFilters, FrontendDefaultHttpErrorHandler}
import app.{FrontendApplicationLoader, FrontendBuildInfo, FrontendComponents}
import com.softwaremill.macwire._
import common._
import conf.switches.SwitchboardLifecycle
import conf.CachedHealthCheckLifeCycle
import controllers.{ArchiveController, HealthCheck}
import dev.{DevAssetsController, DevParametersHttpRequestHandler}
import model.ApplicationIdentity
import play.api.ApplicationLoader.Context
import play.api.BuiltInComponentsFromContext
import play.api.http.{HttpErrorHandler, HttpRequestHandler}
import play.api.libs.ws.WSClient
import play.api.mvc.EssentialFilter
import play.api.routing.Router
import services.RedirectService
import router.Routes

class AppLoader extends FrontendApplicationLoader {
  override def buildComponents(context: Context): FrontendComponents =
    new BuiltInComponentsFromContext(context) with AppComponents
}

trait AppComponents extends FrontendComponents {

  def wsClient: WSClient
  lazy val redirects = wire[RedirectService]

  lazy val devAssetsController = wire[DevAssetsController]
  lazy val healthCheck = wire[HealthCheck]
  lazy val archiveController = wire[ArchiveController]

  override lazy val lifecycleComponents = List(
    wire[CloudWatchMetricsLifecycle],
    wire[SwitchboardLifecycle],
    wire[CachedHealthCheckLifeCycle],
  )

  lazy val router: Router = wire[Routes]

  lazy val appIdentity = ApplicationIdentity("archive")

  val frontendBuildInfo: FrontendBuildInfo = frontend.archive.BuildInfo
  override lazy val httpErrorHandler: HttpErrorHandler = wire[FrontendDefaultHttpErrorHandler]
  override lazy val httpFilters: Seq[EssentialFilter] = wire[CommonFilters].filters
  override lazy val httpRequestHandler: HttpRequestHandler = wire[DevParametersHttpRequestHandler]
  def pekkoActorSystem: PekkoActorSystem
}
