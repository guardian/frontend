import app.{FrontendApplicationLoader, FrontendComponents}
import com.softwaremill.macwire._
import common.dfp.DfpAgentLifecycle
import common.{ApplicationMetrics, CloudWatchMetricsLifecycle, ContentApiMetrics, EmailSubsciptionMetrics}
import common.Logback.LogstashLifecycle
import conf.{CachedHealthCheckLifeCycle, CommonFilters}
import conf.switches.SwitchboardLifecycle
import contentapi.SectionsLookUpLifecycle
import controllers._
import dev.{DevAssetsController, DevParametersHttpRequestHandler}
import http.CorsHttpErrorHandler
import jobs.SiteMapLifecycle
import model.ApplicationIdentity
import ophan.SurgingContentAgentLifecycle
import play.api.ApplicationLoader.Context
import play.api.BuiltInComponentsFromContext
import play.api.http.{HttpErrorHandler, HttpRequestHandler}
import play.api.libs.ws.WSClient
import play.api.mvc.EssentialFilter
import play.api.routing.Router
import services.{ConfigAgentLifecycle, IndexListingsLifecycle}
import router.Routes

class AppLoader extends FrontendApplicationLoader {
  override def buildComponents(context: Context): FrontendComponents = new BuiltInComponentsFromContext(context) with AppComponents
}

trait Controllers extends ApplicationsControllers {
  self: FrontendComponents =>
  def wsClient: WSClient
  lazy val devAssetsController = wire[DevAssetsController]
  lazy val healthCheck = wire[HealthCheck]
  lazy val assets = wire[Assets]
  lazy val emailSignupController = wire[EmailSignupController]
  lazy val surveyPageController = wire[SurveyPageController]
}

trait AppLifecycleComponents {
  self: FrontendComponents with Controllers =>

  override lazy val lifecycleComponents = List(
    wire[LogstashLifecycle],
    wire[ConfigAgentLifecycle],
    wire[CloudWatchMetricsLifecycle],
    wire[DfpAgentLifecycle],
    wire[SurgingContentAgentLifecycle],
    wire[IndexListingsLifecycle],
    wire[SectionsLookUpLifecycle],
    wire[SwitchboardLifecycle],
    wire[SiteMapLifecycle],
    wire[CachedHealthCheckLifeCycle]
  )
}

trait AppComponents extends FrontendComponents with AppLifecycleComponents with Controllers {

  lazy val router: Router = wire[Routes]

  lazy val appIdentity = ApplicationIdentity("frontend-applications")

  override lazy val appMetrics = ApplicationMetrics(
    ContentApiMetrics.HttpTimeoutCountMetric,
    ContentApiMetrics.HttpLatencyTimingMetric,
    ContentApiMetrics.ContentApiErrorMetric,
    EmailSubsciptionMetrics.EmailSubmission,
    EmailSubsciptionMetrics.EmailFormError,
    EmailSubsciptionMetrics.NotAccepted,
    EmailSubsciptionMetrics.APIHTTPError,
    EmailSubsciptionMetrics.APINetworkError,
    EmailSubsciptionMetrics.ListIDError,
    EmailSubsciptionMetrics.AllEmailSubmission
  )


  override lazy val httpErrorHandler: HttpErrorHandler = wire[CorsHttpErrorHandler]
  override lazy val httpFilters: Seq[EssentialFilter] = wire[CommonFilters].filters
  override lazy val httpRequestHandler: HttpRequestHandler = wire[DevParametersHttpRequestHandler]
}

