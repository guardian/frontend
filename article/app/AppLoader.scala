import _root_.commercial.targeting.TargetingLifecycle
import org.apache.pekko.actor.{ActorSystem => PekkoActorSystem}
import app.{FrontendApplicationLoader, FrontendBuildInfo, FrontendComponents}
import com.softwaremill.macwire._
import common.Assets.DiscussionExternalAssetsLifecycle
import common.Logback.{LogbackOperationsPool, LogstashLifecycle}
import common._
import common.dfp.DfpAgentLifecycle
import concurrent.BlockingOperations
import conf.{CachedHealthCheckLifeCycle, Configuration}
import conf.switches.SwitchboardLifecycle
import contentapi.{CapiHttpClient, ContentApiClient, HttpClient}
import controllers.{ArticleControllers, HealthCheck}
import dev.{DevAssetsController, DevParametersHttpRequestHandler}
import http.{CommonFilters, CorsHttpErrorHandler}
import jobs.{MessageUsLifecycle, StoreNavigationLifecycleComponent, TopicLifecycle}
import model.{ApplicationIdentity, MessageUsConfigData, TopicsApiResponse}
import play.api.ApplicationLoader.Context
import play.api.BuiltInComponentsFromContext
import play.api.http.{HttpErrorHandler, HttpRequestHandler}
import play.api.mvc.EssentialFilter
import play.api.routing.Router
import router.Routes
import services.fronts.FrontJsonFapiLive
import services.newsletters.{NewsletterApi, NewsletterSignupAgent, NewsletterSignupLifecycle}
import services.ophan.SurgingContentAgentLifecycle
import services.{
  MessageUsService,
  NewspaperBooksAndSectionsAutoRefresh,
  OphanApi,
  S3Client,
  S3ClientImpl,
  SkimLinksCacheLifeCycle,
}
import topics.TopicService
import app.LifecycleComponent
import renderers.DotcomRenderingService

class AppLoader extends FrontendApplicationLoader {
  override def buildComponents(context: Context): FrontendComponents =
    new BuiltInComponentsFromContext(context) with AppComponents
}

trait TopicServices {
  lazy val topicS3Client: S3Client[TopicsApiResponse] = new S3ClientImpl(Configuration.aws.topMentionsStoreBucket)
  lazy val topicService: TopicService = wire[TopicService]
}

trait MessageUsServices {
  lazy val messageUsS3Client: S3Client[MessageUsConfigData] = new S3ClientImpl(Configuration.aws.messageUsStoreBucket)
  lazy val messageUsService: MessageUsService = wire[MessageUsService]
}

trait AppComponents extends FrontendComponents with ArticleControllers with TopicServices with MessageUsServices {

  lazy val newsletterApi: NewsletterApi = wire[NewsletterApi]
  lazy val newsletterSignupAgent: NewsletterSignupAgent = wire[NewsletterSignupAgent]
  lazy val capiHttpClient: HttpClient = wire[CapiHttpClient]
  lazy val contentApiClient: ContentApiClient = wire[ContentApiClient]
  lazy val ophanApi: OphanApi = wire[OphanApi]

  lazy val healthCheck: HealthCheck = wire[HealthCheck]
  lazy val devAssetsController: DevAssetsController = wire[DevAssetsController]
  lazy val logbackOperationsPool: LogbackOperationsPool = wire[LogbackOperationsPool]

  lazy val remoteRender: DotcomRenderingService = wire[renderers.DotcomRenderingService]

  override lazy val lifecycleComponents: List[LifecycleComponent] = List(
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
    wire[TopicLifecycle],
    wire[NewsletterSignupLifecycle],
    wire[MessageUsLifecycle],
  )

  lazy val router: Router = wire[Routes]

  lazy val appIdentity: ApplicationIdentity = ApplicationIdentity("article")

  override lazy val appMetrics: ApplicationMetrics = ApplicationMetrics(
    ContentApiMetrics.HttpLatencyTimingMetric,
    ContentApiMetrics.HttpTimeoutCountMetric,
    ContentApiMetrics.ContentApiErrorMetric,
    ContentApiMetrics.ContentApiRequestsMetric,
    DCRMetrics.DCRLatencyMetric,
    DCRMetrics.DCRRequestCountMetric,
  )

  val frontendBuildInfo: FrontendBuildInfo = frontend.article.BuildInfo
  override lazy val httpErrorHandler: HttpErrorHandler = wire[CorsHttpErrorHandler]
  override lazy val httpFilters: Seq[EssentialFilter] = wire[CommonFilters].filters
  override lazy val httpRequestHandler: HttpRequestHandler = wire[DevParametersHttpRequestHandler]

  def pekkoActorSystem: PekkoActorSystem
}
