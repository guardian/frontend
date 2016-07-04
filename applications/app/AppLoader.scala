import app.{FrontendComponents, FrontendApplicationLoader}
import com.softwaremill.macwire._
import common.dfp.DfpAgentLifecycle
import common.{EmailSubsciptionMetrics, ContentApiMetrics, ApplicationMetrics, CloudWatchMetricsLifecycle}
import common.Logback.LogstashLifecycle
import conf.{CommonFilters, CachedHealthCheckLifeCycle}
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
import play.api.mvc.EssentialFilter
import play.api.routing.Router
import services.{IndexListingsLifecycle, ConfigAgentLifecycle}
import router.Routes

class AppLoader extends FrontendApplicationLoader {
  override def buildComponents(context: Context): FrontendComponents = new BuiltInComponentsFromContext(context) with AppComponents
}

trait Controllers {
  self: FrontendComponents =>
  lazy val devAssetsController = wire[DevAssetsController]
  lazy val healthCheck = wire[HealthCheck]
  lazy val siteMapController = wire[SiteMapController]
  lazy val assets = wire[Assets]
  lazy val crosswordPageController = wire[CrosswordPageController]
  lazy val crosswordSearchController = wire[CrosswordSearchController]
  lazy val notificationsController = wire[NotificationsController]
  lazy val emailSignupController = wire[EmailSignupController]
  lazy val tagIndexController = wire[TagIndexController]
  lazy val embedController = wire[EmbedController]
  lazy val preferencesController = wire[PreferencesController]
  lazy val optInController = wire[OptInController]
  lazy val webAppController = wire[WebAppController]
  lazy val newspaperController = wire[NewspaperController]
  lazy val quizController = wire[QuizController]
  lazy val allIndexController = wire[AllIndexController]
  lazy val latestIndexController = wire[LatestIndexController]
  lazy val sudokuController = wire[SudokusController]
  lazy val galleryController = wire[GalleryController]
  lazy val imageContentController = wire[ImageContentController]
  lazy val mediaController = wire[MediaController]
  lazy val interactiveController = wire[InteractiveController]
  lazy val shortUrlsController = wire[ShortUrlsController]
  lazy val indexController = wire[IndexController]
  lazy val siteVerificationController = wire[SiteVerificationController]
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

