import akka.actor.ActorSystem
import app.{FrontendApplicationLoader, FrontendBuildInfo, FrontendComponents}
import com.softwaremill.macwire._
import commercial.CommercialLifecycle
import commercial.controllers.{CommercialControllers, HealthCheck}
import commercial.model.capi.CapiAgent
import commercial.model.feeds.{FeedsFetcher, FeedsParser}
import commercial.model.merchandise.books.{BestsellersAgent, BookFinder, MagentoService}
import commercial.model.merchandise.events.{LiveEventAgent, MasterclassAgent}
import commercial.model.merchandise.jobs.{Industries, JobsAgent}
import commercial.model.merchandise.travel.TravelOffersAgent
import common.CloudWatchMetricsLifecycle
import common.Logback.{LogbackOperationsPool, LogstashLifecycle}
import common.dfp.DfpAgentLifecycle
import conf.switches.SwitchboardLifecycle
import conf.CachedHealthCheckLifeCycle
import contentapi.{CapiHttpClient, ContentApiClient, HttpClient}
import dev.{DevAssetsController, DevParametersHttpRequestHandler}
import http.{CommonFilters, CorsHttpErrorHandler}
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
  def actorSystem: ActorSystem
  implicit val executionContext: ExecutionContext

  lazy val magentoService = wire[MagentoService]
  lazy val capiHttpClient: HttpClient = wire[CapiHttpClient]
  lazy val contentApiClient = wire[ContentApiClient]

  lazy val bookFinder = wire[BookFinder]
  lazy val bestsellersAgent = wire[BestsellersAgent]
  lazy val liveEventAgent = wire[LiveEventAgent]
  lazy val masterclassAgent = wire[MasterclassAgent]
  lazy val travelOffersAgent = wire[TravelOffersAgent]
  lazy val jobsAgent = wire[JobsAgent]
  lazy val capiAgent = wire[CapiAgent]
  lazy val industries = wire[Industries]

  lazy val feedsFetcher = wire[FeedsFetcher]
  lazy val feedsParser = wire[FeedsParser]
}

trait AppComponents extends FrontendComponents with CommercialControllers with CommercialServices {

  lazy val devAssetsController = wire[DevAssetsController]
  lazy val healthCheck = wire[HealthCheck]
  lazy val logbackOperationsPool = wire[LogbackOperationsPool]

  override lazy val lifecycleComponents = List(
    wire[LogstashLifecycle],
    wire[CommercialLifecycle],
    wire[DfpAgentLifecycle],
    wire[SwitchboardLifecycle],
    wire[CloudWatchMetricsLifecycle],
    wire[CachedHealthCheckLifeCycle],
  )

  lazy val router: Router = wire[Routes]

  lazy val appIdentity = ApplicationIdentity("commercial")

  val frontendBuildInfo: FrontendBuildInfo = frontend.commercial.BuildInfo
  override lazy val httpErrorHandler: HttpErrorHandler = wire[CorsHttpErrorHandler]
  override lazy val httpFilters: Seq[EssentialFilter] = wire[CommonFilters].filters
  override lazy val httpRequestHandler: HttpRequestHandler = wire[DevParametersHttpRequestHandler]

  def actorSystem: ActorSystem
}
