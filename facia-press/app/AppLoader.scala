import app.{FrontendComponents, FrontendApplicationLoader}
import app.{FrontendApplicationLoader, FrontendComponents}
import com.softwaremill.macwire._
import common._
import common.Logback.LogstashLifecycle
import conf.switches.SwitchboardLifecycle
import controllers.{Application, HealthCheck}
import frontpress.{DraftFapiFrontPress, FrontPressCron, LiveFapiFrontPress, ToolPressQueueWorker}
import lifecycle.FaciaPressLifecycle
import model.ApplicationIdentity
import play.api.ApplicationLoader.Context
import play.api.routing.Router
import play.api._
import play.api.libs.ws.WSClient
import services.ConfigAgentLifecycle
import router.Routes

class AppLoader extends FrontendApplicationLoader {
  override def buildComponents(context: Context): FrontendComponents = new BuiltInComponentsFromContext(context) with AppComponents
}

trait Controllers {
  def wsClient: WSClient
  def toolPressQueueWorker: ToolPressQueueWorker
  def liveFapiFrontPress: LiveFapiFrontPress
  def draftFapiFrontPress: DraftFapiFrontPress
  lazy val healthCheck = wire[HealthCheck]
  lazy val applicationController: Application = wire[Application]
}

trait FapiFrontPresses {
  def wsClient: WSClient
  lazy val liveFapiFrontPress = wire[LiveFapiFrontPress]
  lazy val draftFapiFrontPress = wire[DraftFapiFrontPress]
  lazy val toolPressQueueWorker = wire[ToolPressQueueWorker]
  lazy val frontPressCron = wire[FrontPressCron]
}

trait AppLifecycleComponents extends FapiFrontPresses {
  self: FrontendComponents =>

  override lazy val lifecycleComponents = List(
    wire[LogstashLifecycle],
    wire[ConfigAgentLifecycle],
    wire[SwitchboardLifecycle],
    wire[CloudWatchMetricsLifecycle],
    wire[FaciaPressLifecycle]
  )
}

trait AppComponents extends FrontendComponents with AppLifecycleComponents with Controllers {

  lazy val router: Router = wire[Routes]

  lazy val appIdentity = ApplicationIdentity("frontend-facia-press")

  override lazy val appMetrics = ApplicationMetrics(
    FaciaPressMetrics.FrontPressCronSuccess,
    ContentApiMetrics.HttpLatencyTimingMetric,
    ContentApiMetrics.HttpTimeoutCountMetric,
    ContentApiMetrics.ContentApi404Metric,
    ContentApiMetrics.ContentApiErrorMetric,
    FaciaPressMetrics.UkPressLatencyMetric,
    FaciaPressMetrics.UsPressLatencyMetric,
    FaciaPressMetrics.AuPressLatencyMetric,
    FaciaPressMetrics.AllFrontsPressLatencyMetric
  )
}
