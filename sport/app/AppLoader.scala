import akka.actor.ActorSystem
import http.{CommonFilters, CorsHttpErrorHandler}
import app.{FrontendApplicationLoader, FrontendComponents}
import com.softwaremill.macwire._
import common._
import common.Logback.LogstashLifecycle
import conf.switches.SwitchboardLifecycle
import conf.{CachedHealthCheckLifeCycle, FootballClient, FootballLifecycle}
import contentapi.{CapiHttpClient, ContentApiClient, HttpClient}
import cricket.conf.CricketLifecycle
import cricket.controllers.CricketControllers
import conf.cricketPa.PaFeed
import dev.{DevAssetsController, DevParametersHttpRequestHandler}
import feed.{CompetitionsProvider, CompetitionsService}
import football.controllers.{FootballControllers, HealthCheck}
import jobs.CricketStatsJob
import model.ApplicationIdentity
import services.ophan.SurgingContentAgentLifecycle
import play.api.ApplicationLoader.Context
import play.api.BuiltInComponentsFromContext
import play.api.http.{HttpErrorHandler, HttpRequestHandler}
import play.api.mvc.EssentialFilter
import play.api.routing.Router
import play.api.libs.ws.WSClient
import rugby.conf.RugbyLifecycle
import router.Routes
import rugby.controllers.RugbyControllers
import rugby.feed.{CapiFeed, OptaFeed}
import rugby.jobs.RugbyStatsJob
import services.OphanApi

class AppLoader extends FrontendApplicationLoader {
  override def buildComponents(context: Context): FrontendComponents = new BuiltInComponentsFromContext(context) with AppComponents
}

trait SportServices {
  def wsClient: WSClient
  def actorSystem: ActorSystem
  lazy val capiHttpClient: HttpClient = wire[CapiHttpClient]
  lazy val contentApiClient = wire[ContentApiClient]
  lazy val footballClient = wire[FootballClient]
  lazy val competitionDefinitions = CompetitionsProvider.allCompetitions
  lazy val competitionsService = wire[CompetitionsService]
  lazy val cricketPaFeed = wire[PaFeed]
  lazy val cricketStatsJob = wire[CricketStatsJob]
  lazy val rugbyFeed = wire[OptaFeed]
  lazy val rugbyStatsJob = wire[RugbyStatsJob]
  lazy val capiFeed = wire[CapiFeed]
  lazy val ophanApi = wire[OphanApi]
}

trait AppComponents extends FrontendComponents
  with FootballControllers
  with CricketControllers
  with RugbyControllers
  with SportServices {

  lazy val healthCheck = wire[HealthCheck]
  lazy val devAssetsController = wire[DevAssetsController]

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

  lazy val router: Router = wire[Routes]

  lazy val appIdentity = ApplicationIdentity("sport")

  override lazy val httpFilters: Seq[EssentialFilter] = wire[CommonFilters].filters
  override lazy val httpRequestHandler: HttpRequestHandler = wire[DevParametersHttpRequestHandler]
  override lazy val httpErrorHandler: HttpErrorHandler = wire[CorsHttpErrorHandler]
}
