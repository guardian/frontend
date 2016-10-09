package commercial

import http.CorsHttpErrorHandler
import app.{FrontendApplicationLoader, FrontendComponents}
import com.softwaremill.macwire._
import commercial.feeds.{FeedsFetcher, FeedsParser}
import akka.actor.ActorSystem
import model.commercial.books.{BestsellersAgent, BookFinder, MagentoService}
import common.Logback.LogstashLifecycle
import conf.switches.SwitchboardLifecycle
import conf.{CachedHealthCheckLifeCycle, CommonFilters}
import contentapi.{CapiHttpClient, ContentApiClient, HttpClient}
import controllers.HealthCheck
import commercial.controllers.CommercialControllers
import common.CloudWatchMetricsLifecycle
import model.ApplicationIdentity
import dev.{DevAssetsController, DevParametersHttpRequestHandler}
import model.ApplicationIdentity
import model.commercial.CapiAgent
import model.commercial.events.{LiveEventAgent, MasterclassAgent}
import model.commercial.jobs.{Industries, JobsAgent}
import model.commercial.travel.TravelOffersAgent
import play.api.ApplicationLoader.Context
import play.api.http.{HttpErrorHandler, HttpRequestHandler}
import play.api.mvc.EssentialFilter
import play.api.routing.Router
import play.api._
import play.api.libs.ws.WSClient
import router.Routes

class AppLoader extends FrontendApplicationLoader {
  override def buildComponents(context: Context): FrontendComponents = new BuiltInComponentsFromContext(context) with AppComponents
}

trait Controllers extends CommercialControllers {
  def wsClient: WSClient
  lazy val devAssetsController = wire[DevAssetsController]
  lazy val healthCheck = wire[HealthCheck]
}

trait CommercialServices {
  def wsClient: WSClient
  def actorSystem: ActorSystem

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

trait AppLifecycleComponents {
  self: FrontendComponents with Controllers with CommercialServices =>

  override lazy val lifecycleComponents = List(
    wire[LogstashLifecycle],
    wire[CommercialLifecycle],
    wire[SwitchboardLifecycle],
    wire[CloudWatchMetricsLifecycle],
    wire[CachedHealthCheckLifeCycle]
  )
}

trait AppComponents extends FrontendComponents with AppLifecycleComponents with Controllers with CommercialServices {

  lazy val router: Router = wire[Routes]

  lazy val appIdentity = ApplicationIdentity("frontend-commercial")

  override lazy val httpErrorHandler: HttpErrorHandler = wire[CorsHttpErrorHandler]
  override lazy val httpFilters: Seq[EssentialFilter] = wire[CommonFilters].filters
  override lazy val httpRequestHandler: HttpRequestHandler = wire[DevParametersHttpRequestHandler]
}
