import app.{FrontendComponents, FrontendApplicationLoader}
import com.softwaremill.macwire._
import common._
import common.Logback.LogstashLifecycle
import conf.switches.SwitchboardLifecycle
import controllers.{Application, HealthCheck}
import lifecycle.FaciaPressLifecycle
import model.ApplicationIdentity
import play.api.ApplicationLoader.Context
import play.api.routing.Router
import play.api._
import services.ConfigAgentLifecycle
import router.Routes

class AppLoader extends FrontendApplicationLoader {
  override def buildComponents(context: Context): FrontendComponents = new BuiltInComponentsFromContext(context) with AppComponents
}

trait Controllers {
  lazy val healthCheck = wire[HealthCheck]
  lazy val applicationController = wire[Application]
}

trait AppLifecycleComponents {
  self: FrontendComponents with Controllers =>

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
