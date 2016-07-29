import app.{FrontendComponents, FrontendApplicationLoader}
import com.softwaremill.macwire._
import common._
import common.Logback.LogstashLifecycle
import common.dfp.FaciaDfpAgentLifecycle
import conf.switches.SwitchboardLifecycle
import conf.{CachedHealthCheckLifeCycle, CommonFilters}
import controllers.front.{FrontJsonFapiDraft, FrontJsonFapiLive}
import controllers.{Assets, FaciaControllers, HealthCheck}
import crosswords.TodaysCrosswordGridLifecycle
import dev.{DevAssetsController, DevParametersHttpRequestHandler}
import headlines.ABHeadlinesLifecycle
import model.ApplicationIdentity
import ophan.SurgingContentAgentLifecycle
import play.api.ApplicationLoader.Context
import play.api.http.HttpRequestHandler
import play.api.mvc.EssentialFilter
import play.api.routing.Router
import play.api._
import play.api.libs.ws.WSClient
import services.{ConfigAgentLifecycle, IndexListingsLifecycle}
import router.Routes

class AppLoader extends FrontendApplicationLoader {
  override def buildComponents(context: Context): FrontendComponents = new BuiltInComponentsFromContext(context) with AppComponents
}

trait FapiServices {
  def wsClient: WSClient
  lazy val frontJsonFapiLive = wire[FrontJsonFapiLive]
  lazy val frontJsonFapiDraft = wire[FrontJsonFapiDraft]
}

trait Controllers extends FaciaControllers {
  self: BuiltInComponents =>
  def wsClient: WSClient
  lazy val healthCheck = wire[HealthCheck]
  lazy val devAssetsController = wire[DevAssetsController]
  lazy val assets = wire[Assets]
}

trait AppLifecycleComponents {
  self: FrontendComponents with Controllers =>

  override lazy val lifecycleComponents = List(
    wire[LogstashLifecycle],
    wire[ConfigAgentLifecycle],
    wire[CloudWatchMetricsLifecycle],
    wire[FaciaDfpAgentLifecycle],
    wire[SurgingContentAgentLifecycle],
    wire[IndexListingsLifecycle],
    wire[TodaysCrosswordGridLifecycle],
    wire[SwitchboardLifecycle],
    wire[ABHeadlinesLifecycle],
    wire[CachedHealthCheckLifeCycle]
  )
}

trait AppComponents extends FrontendComponents with AppLifecycleComponents with Controllers with FapiServices {

  lazy val router: Router = wire[Routes]

  lazy val appIdentity = ApplicationIdentity("frontend-facia")

  override lazy val httpFilters: Seq[EssentialFilter] = wire[CommonFilters].filters
  override lazy val httpRequestHandler: HttpRequestHandler = wire[DevParametersHttpRequestHandler]
}
