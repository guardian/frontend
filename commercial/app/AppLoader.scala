import commercial.CommercialLifecycle
import http.CorsHttpErrorHandler
import app.{FrontendComponents, FrontendApplicationLoader}
import com.softwaremill.macwire._
import common._
import _root_.commercial.feeds.{FeedsFetcher, FeedsParser}
import model.commercial.books.{BestsellersAgent, BookFinder, MagentoService}
import common.Logback.LogstashLifecycle
import conf.switches.SwitchboardLifecycle
import conf.{CommonFilters, CachedHealthCheckLifeCycle}
import controllers.HealthCheck
import controllers.commercial.CommercialControllers
import dev.{DevAssetsController, DevParametersHttpRequestHandler}
import model.ApplicationIdentity
import model.commercial.events.LiveEventAgent
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
  lazy val devAssetsController = wire[DevAssetsController]
  lazy val healthCheck = wire[HealthCheck]
}

trait CommercialServices {
  def wsClient: WSClient

  lazy val magentoService = wire[MagentoService]
  lazy val bookFinder = wire[BookFinder]
  lazy val bestsellersAgent = wire[BestsellersAgent]
  lazy val liveEventAgent = wire[LiveEventAgent]

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
