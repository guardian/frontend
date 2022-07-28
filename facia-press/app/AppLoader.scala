import app.{FrontendApplicationLoader, FrontendComponents}
import com.softwaremill.macwire._
import common._
import common.Logback.{LogbackOperationsPool, LogstashLifecycle}
import conf.switches.SwitchboardLifecycle
import contentapi.{CapiHttpClient, ContentApiClient, HttpClient}
import controllers.{Application, HealthCheck}
import frontpress.{DraftFapiFrontPress, FrontPressCron, LiveFapiFrontPress, ToolPressQueueWorker}
import lifecycle.FaciaPressLifecycle
import model.ApplicationIdentity
import play.api.ApplicationLoader.Context
import play.api.routing.Router
import play.api._
import play.api.mvc.EssentialFilter
import services.ConfigAgentLifecycle
import router.Routes
import _root_.commercial.targeting.TargetingLifecycle
import akka.actor.ActorSystem

class AppLoader extends FrontendApplicationLoader {
  override def buildComponents(context: Context): FrontendComponents =
    new BuiltInComponentsFromContext(context) with AppComponents
}

trait AppComponents extends FrontendComponents {

  lazy val capiHttpClient: HttpClient = wire[CapiHttpClient]
  lazy val contentApiClient = wire[ContentApiClient]

  lazy val liveFapiFrontPress = wire[LiveFapiFrontPress]
  lazy val draftFapiFrontPress = wire[DraftFapiFrontPress]
  lazy val toolPressQueueWorker = wire[ToolPressQueueWorker]
  lazy val frontPressCron = wire[FrontPressCron]

  lazy val healthCheck = wire[HealthCheck]
  lazy val applicationController: Application = wire[Application]
  lazy val logbackOperationsPool = wire[LogbackOperationsPool]

  override lazy val lifecycleComponents = List(
    wire[LogstashLifecycle],
    wire[ConfigAgentLifecycle],
    wire[SwitchboardLifecycle],
    wire[CloudWatchMetricsLifecycle],
    wire[FaciaPressLifecycle],
    wire[TargetingLifecycle],
  )

  lazy val router: Router = wire[Routes]

  lazy val appIdentity = ApplicationIdentity("facia-press")

  override lazy val appMetrics = ApplicationMetrics(
    FaciaPressMetrics.FrontPressCronSuccess,
    ContentApiMetrics.HttpLatencyTimingMetric,
    ContentApiMetrics.HttpTimeoutCountMetric,
    ContentApiMetrics.ContentApi404Metric,
    ContentApiMetrics.ContentApiErrorMetric,
    FaciaPressMetrics.UkPressLatencyMetric,
    FaciaPressMetrics.UsPressLatencyMetric,
    FaciaPressMetrics.AuPressLatencyMetric,
    FaciaPressMetrics.AllFrontsPressLatencyMetric,
    FaciaPressMetrics.FrontPressContentSize,
    FaciaPressMetrics.FrontDecodingLatency,
  )

  override lazy val httpFilters: Seq[EssentialFilter] = Nil
  def actorSystem: ActorSystem
}
