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

  override def applicationMetrics = Map(
    ("front-press-failure", getTotalPressFailureCount.toDouble),
    ("front-press-success", getTotalPressSuccessCount.toDouble),
    ("front-press-draft-failure", FaciaPressMetrics.FrontPressDraftFailure.getAndReset.toDouble),
    ("front-press-draft-success", FaciaPressMetrics.FrontPressDraftSuccess.getAndReset.toDouble),
    ("front-press-live-failure", FaciaPressMetrics.FrontPressLiveFailure.getAndReset.toDouble),
    ("front-press-live-success", FaciaPressMetrics.FrontPressLiveSuccess.getAndReset.toDouble),
    ("front-press-cron-success", FaciaPressMetrics.FrontPressCronSuccess.getAndReset.toDouble),
    ("front-press-cron-failure", FaciaPressMetrics.FrontPressCronFailure.getAndReset.toDouble),
    ("elastic-content-api-calls", ContentApiMetrics.ElasticHttpTimingMetric.getAndReset.toDouble),
    ("elastic-content-api-timeouts", ContentApiMetrics.ElasticHttpTimeoutCountMetric.getAndReset.toDouble),
    ("content-api-404", ContentApiMetrics.ContentApi404Metric.getAndReset.toDouble),
    ("content-api-client-parse-exceptions", ContentApiMetrics.ContentApiJsonParseExceptionMetric.getAndReset.toDouble),
    ("content-api-client-mapping-exceptions", ContentApiMetrics.ContentApiJsonMappingExceptionMetric.getAndReset.toDouble),
    ("content-api-invalid-content-exceptions", FaciaToolMetrics.InvalidContentExceptionMetric.getAndReset.toDouble),
    ("s3-client-exceptions", S3Metrics.S3ClientExceptionsMetric.getAndReset.toDouble),
    ("s3-authorization-errors", S3Metrics.S3AuthorizationError.getAndReset.toDouble),
    ("content-api-seo-request-success", FaciaPressMetrics.ContentApiSeoRequestSuccess.getAndReset.toDouble),
    ("content-api-seo-request-failure", FaciaPressMetrics.ContentApiSeoRequestFailure.getAndReset.toDouble),
    ("content-api-fallbacks", FaciaPressMetrics.MemcachedFallbackMetric.getAndReset.toDouble)
  )

  override def latencyMetrics: List[FrontendMetric] = List(UkPressLatencyMetric, UsPressLatencyMetric, AuPressLatencyMetric,
                                     AllFrontsPressLatencyMetric)

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
