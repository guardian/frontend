import akka.actor.ActorSystem
import app.{FrontendApplicationLoader, FrontendComponents}
import com.softwaremill.macwire._
import common._
import common.Logback.LogstashLifecycle
import common.dfp.FaciaDfpAgentLifecycle
import concurrent.BlockingOperations
import conf.switches.SwitchboardLifecycle
import conf.CachedHealthCheckLifeCycle
import controllers.front.{FrontJsonFapiDraft, FrontJsonFapiLive}
import controllers.{FaciaControllers, HealthCheck}
import dev.{DevAssetsController, DevParametersHttpRequestHandler}
import http.CommonFilters
import model.ApplicationIdentity
import services.ophan.SurgingContentAgentLifecycle
import play.api.ApplicationLoader.Context
import play.api.BuiltInComponentsFromContext
import play.api.http.HttpRequestHandler
import play.api.mvc.EssentialFilter
import play.api.routing.Router
import play.api.libs.ws.WSClient
import services._
import router.Routes
import com.typesafe.config.ConfigFactory

class AppLoader extends FrontendApplicationLoader {
  ConfigFactory.load()
  override def buildComponents(context: Context): FrontendComponents = new BuiltInComponentsFromContext(context) with AppComponents
}

trait FapiServices {
  def wsClient: WSClient
  def actorSystem: ActorSystem
  lazy val frontJsonFapiLive = wire[FrontJsonFapiLive]
  lazy val frontJsonFapiDraft = wire[FrontJsonFapiDraft]
  lazy val blockingOperations = wire[BlockingOperations]
}

trait AppComponents extends FrontendComponents with FaciaControllers with FapiServices {

  lazy val healthCheck = wire[HealthCheck]
  lazy val devAssetsController = wire[DevAssetsController]
  lazy val ophanApi = wire[OphanApi]

  override lazy val lifecycleComponents = List(
    wire[LogstashLifecycle],
    wire[ConfigAgentLifecycle],
    wire[CloudWatchMetricsLifecycle],
    wire[FaciaDfpAgentLifecycle],
    wire[SurgingContentAgentLifecycle],
    wire[IndexListingsLifecycle],
    wire[SwitchboardLifecycle],
    wire[CachedHealthCheckLifeCycle]
  )

  lazy val router: Router = wire[Routes]

  lazy val appIdentity = ApplicationIdentity("facia")

  override lazy val appMetrics = ApplicationMetrics(
    FaciaPressMetrics.FrontDecodingLatency
  )

  override lazy val httpFilters: Seq[EssentialFilter] = wire[CommonFilters].filters
  override lazy val httpRequestHandler: HttpRequestHandler = wire[DevParametersHttpRequestHandler]
}
