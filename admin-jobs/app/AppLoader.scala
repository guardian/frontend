import app.{FrontendApplicationLoader, FrontendComponents}
import com.softwaremill.macwire._
import common._
import common.Logback.LogstashLifecycle
import conf.switches.SwitchboardLifecycle
import conf.CachedHealthCheckLifeCycle
import controllers.BreakingNews.BreakingNewsApi
import controllers.BreakingNews.S3BreakingNews
import controllers.{AdminJobsControllers, HealthCheck}
import dev.DevParametersHttpRequestHandler
import http.CommonFilters
import model.ApplicationIdentity
import play.api.ApplicationLoader.Context
import play.api.mvc.EssentialFilter
import play.api.routing.Router
import services.ConfigAgentLifecycle
import jobs.CommercialClientSideLoggingLifecycle
import play.api.http.HttpRequestHandler
import play.api.{BuiltInComponentsFromContext, Environment}
import router.Routes

class AppLoader extends FrontendApplicationLoader {
  override def buildComponents(context: Context): FrontendComponents = new BuiltInComponentsFromContext(context) with AppComponents
}

trait AdminJobsServices {
  def environment: Environment
  lazy val s3BreakingNews = wire[S3BreakingNews]
  lazy val breakingNewsApi = wire[BreakingNewsApi]
}


trait AppComponents extends FrontendComponents with AdminJobsControllers with AdminJobsServices {

  lazy val healthCheck = wire[HealthCheck]

  override lazy val lifecycleComponents = List(
    wire[LogstashLifecycle],
    wire[ConfigAgentLifecycle],
    wire[CloudWatchMetricsLifecycle],
    wire[SwitchboardLifecycle],
    wire[CachedHealthCheckLifeCycle],
    wire[CommercialClientSideLoggingLifecycle]
  )

  lazy val router: Router = wire[Routes]

  lazy val appIdentity = ApplicationIdentity("admin-jobs")

  override lazy val appMetrics = ApplicationMetrics(
    ContentApiMetrics.HttpTimeoutCountMetric,
    ContentApiMetrics.HttpLatencyTimingMetric,
    ContentApiMetrics.ContentApiErrorMetric
  )

  override lazy val httpFilters: Seq[EssentialFilter] = wire[CommonFilters].filters
  override lazy val httpRequestHandler: HttpRequestHandler = wire[DevParametersHttpRequestHandler]
}
