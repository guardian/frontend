import akka.actor.ActorSystem
import akka.stream.Materializer
import app.{FrontendApplicationLoader, FrontendBuildInfo, FrontendComponents}
import com.softwaremill.macwire._
import common.Logback.{LogbackOperationsPool, LogstashLifecycle}
import common._
import conf.cricketPa.PaFeed
import conf.switches.SwitchboardLifecycle
import conf.{CachedHealthCheckLifeCycle, FootballClient, FootballLifecycle}
import contentapi.{CapiHttpClient, ContentApiClient, HttpClient}
import cricket.conf.CricketLifecycle
import cricket.controllers.CricketControllers
import dev.{DevAssetsController, DevParametersHttpRequestHandler}
import feed.{CompetitionsProvider, CompetitionsService}
import football.controllers.{FootballControllers, HealthCheck}
import http.{CommonFilters, CorsHttpErrorHandler}
import jobs.CricketStatsJob
import model.ApplicationIdentity
import play.api.ApplicationLoader.Context
import play.api.BuiltInComponentsFromContext
import play.api.http.{HttpErrorHandler, HttpRequestHandler}
import play.api.libs.ws.WSClient
import play.api.mvc.EssentialFilter
import play.api.routing.Router
import router.Routes
import rugby.conf.RugbyLifecycle
import rugby.controllers.RugbyControllers
import rugby.feed.{CapiFeed, PARugbyClient, PARugbyFeed}
import rugby.jobs.RugbyStatsJob
import services.OphanApi
import services.ophan.SurgingContentAgentLifecycle

import scala.concurrent.ExecutionContext

class AppLoader extends FrontendApplicationLoader {
  override def buildComponents(context: Context): FrontendComponents =
    new BuiltInComponentsFromContext(context) with AppComponents
}

trait SportServices {
  def wsClient: WSClient
  def actorSystem: ActorSystem
  def materializer: Materializer
  implicit val executionContext: ExecutionContext

  lazy val capiHttpClient: HttpClient = wire[CapiHttpClient]
  lazy val contentApiClient = wire[ContentApiClient]
  lazy val footballClient = wire[FootballClient]
  lazy val competitionDefinitions = CompetitionsProvider.allCompetitions
  lazy val competitionsService = wire[CompetitionsService]
  lazy val cricketPaFeed = wire[PaFeed]
  lazy val cricketStatsJob = wire[CricketStatsJob]
  lazy val rugbyClient = wire[PARugbyClient]
  lazy val rugbyFeed = wire[PARugbyFeed]
  lazy val rugbyStatsJob = wire[RugbyStatsJob]
  lazy val capiFeed = wire[CapiFeed]
  lazy val ophanApi = wire[OphanApi]
}

trait AppComponents
    extends FrontendComponents
    with FootballControllers
    with CricketControllers
    with RugbyControllers
    with SportServices {

  lazy val healthCheck = wire[HealthCheck]
  lazy val devAssetsController = wire[DevAssetsController]
  lazy val logbackOperationsPool = wire[LogbackOperationsPool]

  override lazy val lifecycleComponents = List(
    wire[LogstashLifecycle],
    wire[CloudWatchMetricsLifecycle],
    wire[SurgingContentAgentLifecycle],
    wire[SwitchboardLifecycle],
    wire[FootballLifecycle],
    wire[CricketLifecycle],
    wire[RugbyLifecycle],
    wire[CachedHealthCheckLifeCycle],
  )

  lazy val router: Router = wire[Routes]

  lazy val appIdentity = ApplicationIdentity("sport")

  val frontendBuildInfo: FrontendBuildInfo = frontend.sport.BuildInfo
  override lazy val httpFilters: Seq[EssentialFilter] = wire[CommonFilters].filters
  override lazy val httpRequestHandler: HttpRequestHandler = wire[DevParametersHttpRequestHandler]
  override lazy val httpErrorHandler: HttpErrorHandler = wire[CorsHttpErrorHandler]
  def actorSystem: ActorSystem
}
