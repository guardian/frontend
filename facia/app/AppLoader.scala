import app.{FrontendComponents, FrontendApplicationLoader}
import com.softwaremill.macwire._
import common._
import common.Logback.LogstashLifecycle
import common.dfp.FaciaDfpAgentLifecycle
import conf.switches.SwitchboardLifecycle
import conf.{CommonFilters, CachedHealthCheckLifeCycle}
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
import services.{IndexListingsLifecycle, ConfigAgentLifecycle}
import router.Routes

class AppLoader extends FrontendApplicationLoader {
  override def buildComponents(context: Context): FrontendComponents = new BuiltInComponentsFromContext(context) with AppComponents
}

trait Controllers extends FaciaControllers {
  self: BuiltInComponents =>
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

trait AppComponents extends FrontendComponents with AppLifecycleComponents with Controllers {

  lazy val router: Router = wire[Routes]

  lazy val appIdentity = ApplicationIdentity("frontend-facia")

  override lazy val httpFilters: Seq[EssentialFilter] = wire[CommonFilters].filters
  override lazy val httpRequestHandler: HttpRequestHandler = wire[DevParametersHttpRequestHandler]
}
