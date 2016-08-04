import http.CorsHttpErrorHandler
import app.{FrontendApplicationLoader, FrontendComponents}
import com.softwaremill.macwire._
import common._
import common.Logback.LogstashLifecycle
import conf.switches.SwitchboardLifecycle
import conf.{CachedHealthCheckLifeCycle, CommonFilters, FootballLifecycle}
import cricket.conf.CricketLifecycle
import cricket.controllers.CricketControllers
import cricketPa.PaFeed
import dev.{DevAssetsController, DevParametersHttpRequestHandler}
import football.controllers.{FootballControllers, HealthCheck}
import jobs.CricketStatsJob
import model.ApplicationIdentity
import ophan.SurgingContentAgentLifecycle
import play.api.ApplicationLoader.Context
import play.api.http.{HttpErrorHandler, HttpRequestHandler}
import play.api.mvc.EssentialFilter
import play.api.routing.Router
import play.api._
import play.api.libs.ws.WSClient
import rugby.conf.RugbyLifecycle
import router.Routes
import rugby.controllers.RugbyControllers
import rugby.feed.OptaFeed
import rugby.jobs.RugbyStatsJob

class AppLoader extends FrontendApplicationLoader {
  override def buildComponents(context: Context): FrontendComponents = new BuiltInComponentsFromContext(context) with AppComponents
}

trait SportServices {
  def wsClient: WSClient
  lazy val cricketPaFeed = wire[PaFeed]
  lazy val cricketStatsJob = wire[CricketStatsJob]
  lazy val rugbyFeed = wire[OptaFeed]
  lazy val rugbyStatsJob = wire[RugbyStatsJob]
}

trait Controllers extends FootballControllers with CricketControllers with RugbyControllers {
  def wsClient: WSClient
  lazy val healthCheck = wire[HealthCheck]
  lazy val devAssetsController = wire[DevAssetsController]
}

trait AppLifecycleComponents {
  self: FrontendComponents with Controllers with SportServices =>

  override lazy val lifecycleComponents = List(
    wire[LogstashLifecycle],
    wire[CloudWatchMetricsLifecycle],
    wire[SurgingContentAgentLifecycle],
    wire[SwitchboardLifecycle],
    wire[FootballLifecycle],
    wire[CricketLifecycle],
    wire[RugbyLifecycle],
    wire[CachedHealthCheckLifeCycle]
  )
}

trait AppComponents extends FrontendComponents with AppLifecycleComponents with Controllers with SportServices{

  lazy val router: Router = wire[Routes]

  lazy val appIdentity = ApplicationIdentity("frontend-sport")

  override lazy val httpFilters: Seq[EssentialFilter] = wire[CommonFilters].filters
  override lazy val httpRequestHandler: HttpRequestHandler = wire[DevParametersHttpRequestHandler]
  override lazy val httpErrorHandler: HttpErrorHandler = wire[CorsHttpErrorHandler]
}
