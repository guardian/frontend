import _root_.commercial.targeting.TargetingLifecycle
import akka.actor.ActorSystem
import app.{FrontendApplicationLoader, FrontendComponents}
import com.softwaremill.macwire._
import common.Assets.DiscussionExternalAssetsLifecycle
import common.Logback.{LogbackOperationsPool, LogstashLifecycle}
import common._
import common.dfp.DfpAgentLifecycle
import conf.CachedHealthCheckLifeCycle
import conf.switches.SwitchboardLifecycle
import contentapi.{CapiHttpClient, ContentApiClient, HttpClient}
import controllers.{ArticleControllers, HealthCheck}
import dev.{DevAssetsController, DevParametersHttpRequestHandler}
import http.{CommonFilters, CorsHttpErrorHandler}
import model.ApplicationIdentity
import play.api.ApplicationLoader.Context
import play.api.BuiltInComponentsFromContext
import play.api.http.{HttpErrorHandler, HttpRequestHandler}
import play.api.mvc.EssentialFilter
import play.api.routing.Router
import router.Routes
import services.ophan.SurgingContentAgentLifecycle
import services.{NewspaperBooksAndSectionsAutoRefresh, OphanApi, SkimLinksCacheLifeCycle}
import jobs.{StoreNavigationLifecycleComponent, TopMentionsLifecycle}
import topmentions.{TopMentionsS3Client, TopMentionsS3ClientImpl, TopicService}

class AppLoader extends FrontendApplicationLoader {
  override def buildComponents(context: Context): FrontendComponents =
    new BuiltInComponentsFromContext(context) with AppComponents
}

trait TopicServices {
  lazy val topMentionsS3Client: TopMentionsS3Client = wire[TopMentionsS3ClientImpl]
  lazy val topicService = wire[TopicService]
}

trait AppComponents extends FrontendComponents with ArticleControllers with TopicServices {

  lazy val capiHttpClient: HttpClient = wire[CapiHttpClient]
  lazy val contentApiClient = wire[ContentApiClient]
  lazy val ophanApi = wire[OphanApi]

  lazy val healthCheck = wire[HealthCheck]
  lazy val devAssetsController = wire[DevAssetsController]
  lazy val logbackOperationsPool = wire[LogbackOperationsPool]

  lazy val remoteRender = wire[renderers.DotcomRenderingService]

  override lazy val lifecycleComponents = List(
    wire[LogstashLifecycle],
    wire[NewspaperBooksAndSectionsAutoRefresh],
    wire[DfpAgentLifecycle],
    wire[CloudWatchMetricsLifecycle],
    wire[SurgingContentAgentLifecycle],
    wire[SwitchboardLifecycle],
    wire[CachedHealthCheckLifeCycle],
    wire[TargetingLifecycle],
    wire[DiscussionExternalAssetsLifecycle],
    wire[SkimLinksCacheLifeCycle],
    wire[StoreNavigationLifecycleComponent],
    wire[TopMentionsLifecycle],
  )

  lazy val router: Router = wire[Routes]

  lazy val appIdentity = ApplicationIdentity("article")

  override lazy val appMetrics = ApplicationMetrics(
    ContentApiMetrics.HttpLatencyTimingMetric,
    ContentApiMetrics.HttpTimeoutCountMetric,
    ContentApiMetrics.ContentApiErrorMetric,
    ContentApiMetrics.ContentApiRequestsMetric,
    ArticleRenderingMetrics.RemoteRenderingMetric,
    ArticleRenderingMetrics.LocalRenderingMetric,
  )

  override lazy val httpErrorHandler: HttpErrorHandler = wire[CorsHttpErrorHandler]
  override lazy val httpFilters: Seq[EssentialFilter] = wire[CommonFilters].filters
  override lazy val httpRequestHandler: HttpRequestHandler = wire[DevParametersHttpRequestHandler]

  def actorSystem: ActorSystem
}
