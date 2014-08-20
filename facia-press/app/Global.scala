import common._
import conf.{Configuration => GuardianConfiguration}
import frontpress.{FrontPressCron, ToolPressQueueWorker}
import metrics._
import play.api.GlobalSettings
import services.ConfigAgentLifecycle

object Global extends GlobalSettings
  with ConfigAgentLifecycle
  with CloudWatchApplicationMetrics {
  val pressJobConsumeRateInSeconds: Int = GuardianConfiguration.faciatool.pressJobConsumeRateInSeconds

  private def getTotalPressSuccessCount: Long =
    FaciaPressMetrics.FrontPressLiveSuccess.getResettingValue() + FaciaPressMetrics.FrontPressDraftSuccess.getResettingValue()

  private def getTotalPressFailureCount: Long =
    FaciaPressMetrics.FrontPressLiveFailure.getResettingValue() + FaciaPressMetrics.FrontPressDraftFailure.getResettingValue()

  override def applicationName = "frontend-facia-press"

  override def applicationMetrics = List(
    GaugeMetric("front-press-failure", "Total number of front press failure", () => getTotalPressFailureCount),
    GaugeMetric("front-press-success", "Total number of front press success", () => getTotalPressSuccessCount),
    FaciaPressMetrics.FrontPressDraftFailure,
    FaciaPressMetrics.FrontPressDraftSuccess,
    FaciaPressMetrics.FrontPressLiveFailure,
    FaciaPressMetrics.FrontPressLiveSuccess,
    FaciaPressMetrics.FrontPressCronSuccess,
    FaciaPressMetrics.FrontPressCronFailure,
    ContentApiMetrics.ElasticHttpTimingMetric,
    ContentApiMetrics.ElasticHttpTimeoutCountMetric,
    ContentApiMetrics.ContentApi404Metric,
    ContentApiMetrics.ContentApiJsonParseExceptionMetric,
    ContentApiMetrics.ContentApiJsonMappingExceptionMetric,
    FaciaToolMetrics.InvalidContentExceptionMetric,
    S3Metrics.S3ClientExceptionsMetric,
    S3Metrics.S3AuthorizationError,
    FaciaPressMetrics.ContentApiSeoRequestSuccess,
    FaciaPressMetrics.ContentApiSeoRequestFailure,
    FaciaPressMetrics.MemcachedFallbackMetric,
    UkPressLatencyMetric,
    UsPressLatencyMetric,
    AuPressLatencyMetric,
    AllFrontsPressLatencyMetric
  )

  def scheduleJobs() {
    Jobs.schedule("FaciaToolPressJob", s"0/$pressJobConsumeRateInSeconds * * * * ?") {
      FrontPressCron.run()
    }
  }

  def descheduleJobs() {
    Jobs.deschedule("FaciaToolPressJob")
  }

  override def onStart(app: play.api.Application) {
    super.onStart(app)
    ToolPressQueueWorker.start()
    descheduleJobs()
    scheduleJobs()
  }

  override def onStop(app: play.api.Application) {
    descheduleJobs()
    super.onStop(app)
  }
}
