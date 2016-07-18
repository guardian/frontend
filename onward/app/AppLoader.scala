import http.CorsHttpErrorHandler
import app.{FrontendComponents, FrontendApplicationLoader}
import business.StocksDataLifecycle
import com.softwaremill.macwire._
import common._
import common.Logback.LogstashLifecycle
import conf.switches.SwitchboardLifecycle
import conf.{CommonFilters, CachedHealthCheckLifeCycle}
import controllers.{OnwardControllers, HealthCheck}
import dev.{DevAssetsController, DevParametersHttpRequestHandler}
import feed.{MostPopularFacebookAutoRefreshLifecycle, MostReadLifecycle, OnwardJourneyLifecycle}
import model.ApplicationIdentity
import play.api.ApplicationLoader.Context
import play.api.http.{HttpErrorHandler, HttpRequestHandler}
import play.api.mvc.EssentialFilter
import play.api.routing.Router
import play.api._
import router.Routes

class AppLoader extends FrontendApplicationLoader {
  override def buildComponents(context: Context): FrontendComponents = new BuiltInComponentsFromContext(context) with AppComponents
}

trait Controllers extends OnwardControllers {
  lazy val healthCheck = wire[HealthCheck]
  lazy val devAssetsController = wire[DevAssetsController]
}

trait AppLifecycleComponents {
  self: FrontendComponents with Controllers =>

  override lazy val lifecycleComponents = List(
    wire[LogstashLifecycle],
    wire[OnwardJourneyLifecycle],
    wire[CloudWatchMetricsLifecycle],
    wire[MostReadLifecycle],
    wire[StocksDataLifecycle],
    wire[MostPopularFacebookAutoRefreshLifecycle],
    wire[SwitchboardLifecycle],
    wire[CachedHealthCheckLifeCycle]
  )
}

trait AppComponents extends FrontendComponents with AppLifecycleComponents with Controllers {

  lazy val router: Router = wire[Routes]

  lazy val appIdentity = ApplicationIdentity("frontend-onward")

  val applicationMetrics = ApplicationMetrics(
    ContentApiMetrics.HttpTimeoutCountMetric,
    ContentApiMetrics.ContentApiErrorMetric
  )

  override lazy val httpFilters: Seq[EssentialFilter] = wire[CommonFilters].filters
  override lazy val httpRequestHandler: HttpRequestHandler = wire[DevParametersHttpRequestHandler]
  override lazy val httpErrorHandler: HttpErrorHandler = wire[CorsHttpErrorHandler]
}
