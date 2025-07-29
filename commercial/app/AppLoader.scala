import agents.AdmiralAgent
import org.apache.pekko.actor.{ActorSystem => PekkoActorSystem}
import app.{FrontendApplicationLoader, FrontendBuildInfo, FrontendComponents}
import com.softwaremill.macwire._
import commercial.controllers.{CommercialControllers, HealthCheck}
import commercial.model.capi.CapiAgent
import common.CloudWatchMetricsLifecycle
import common.dfp.DfpAgentLifecycle
import conf.switches.SwitchboardLifecycle
import conf.CachedHealthCheckLifeCycle
import contentapi.{CapiHttpClient, ContentApiClient, HttpClient}
import dev.{DevAssetsController, DevParametersHttpRequestHandler}
import http.{CommonFilters, CorsHttpErrorHandler}
import jobs.AdmiralLifecycle
import model.ApplicationIdentity
import play.api.ApplicationLoader.Context
import play.api.BuiltInComponentsFromContext
import play.api.http.{HttpErrorHandler, HttpRequestHandler}
import play.api.libs.ws.WSClient
import play.api.mvc.EssentialFilter
import play.api.routing.Router
import router.Routes

import scala.concurrent.ExecutionContext

class AppLoader extends FrontendApplicationLoader {
  override def buildComponents(context: Context): FrontendComponents =
    new BuiltInComponentsFromContext(context) with AppComponents
}

trait CommercialServices {
  def wsClient: WSClient
  def pekkoActorSystem: PekkoActorSystem
  implicit val executionContext: ExecutionContext

  lazy val capiHttpClient: HttpClient = wire[CapiHttpClient]
  lazy val contentApiClient = wire[ContentApiClient]

  lazy val capiAgent = wire[CapiAgent]

  lazy val admiralAgent = wire[AdmiralAgent]
}

trait AppComponents extends FrontendComponents with CommercialControllers with CommercialServices {

  lazy val devAssetsController = wire[DevAssetsController]
  lazy val healthCheck = wire[HealthCheck]

  override lazy val lifecycleComponents = List(
    wire[DfpAgentLifecycle],
    wire[SwitchboardLifecycle],
    wire[CloudWatchMetricsLifecycle],
    wire[CachedHealthCheckLifeCycle],
    wire[AdmiralLifecycle],
  )

  lazy val router: Router = wire[Routes]

  lazy val appIdentity = ApplicationIdentity("commercial")

  val frontendBuildInfo: FrontendBuildInfo = frontend.commercial.BuildInfo
  override lazy val httpErrorHandler: HttpErrorHandler = wire[CorsHttpErrorHandler]
  override lazy val httpFilters: Seq[EssentialFilter] = wire[CommonFilters].filters
  override lazy val httpRequestHandler: HttpRequestHandler = wire[DevParametersHttpRequestHandler]

  def pekkoActorSystem: PekkoActorSystem
}
