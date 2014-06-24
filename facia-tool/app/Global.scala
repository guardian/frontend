import common._
import conf.{Gzipper, Management}
import java.io.File
import jobs.FrontPressJob
import play.api._
import play.api.mvc.WithFilters
import services.ConfigAgentLifecycle

object Global extends WithFilters(Gzipper)
  with GlobalSettings
  with CloudWatchApplicationMetrics
  with ConfigAgentLifecycle {

  lazy val devConfig = Configuration.from(Map("session.secure" -> "false"))

  override lazy val applicationName = Management.applicationName
  override def applicationMetrics: Map[String, Double] = Map(
    ("api-usage", FaciaToolMetrics.ApiUsageCount.getAndReset.toDouble),
    ("api-proxy-usage", FaciaToolMetrics.ProxyCount.getAndReset.toDouble),
    ("content-api-put-failure", FaciaToolMetrics.ContentApiPutFailure.getAndReset.toDouble),
    ("content-api-put-success", FaciaToolMetrics.ContentApiPutSuccess.getAndReset.toDouble),
    ("draft-publish", FaciaToolMetrics.DraftPublishCount.getAndReset.toDouble),
    ("auth-expired", FaciaToolMetrics.ExpiredRequestCount.getAndReset.toDouble),
    ("front-press-failure", getTotalPressFailureCount.toDouble),
    ("front-press-success", getTotalPressSuccessCount.toDouble),
    ("front-press-draft-failure", FaciaToolMetrics.FrontPressDraftFailure.getAndReset.toDouble),
    ("front-press-draft-success", FaciaToolMetrics.FrontPressDraftSuccess.getAndReset.toDouble),
    ("front-press-live-failure", FaciaToolMetrics.FrontPressLiveFailure.getAndReset.toDouble),
    ("front-press-live-success", FaciaToolMetrics.FrontPressLiveFailure.getAndReset.toDouble),
    ("front-press-cron-success", FaciaToolMetrics.FrontPressCronSuccess.getAndReset.toDouble),
    ("front-press-cron-failure", FaciaToolMetrics.FrontPressCronFailure.getAndReset.toDouble),
    ("elastic-content-api-calls", ContentApiMetrics.ElasticHttpTimingMetric.getAndReset.toDouble),
    ("solr-content-api-calls", ContentApiMetrics.HttpTimingMetric.getAndReset.toDouble),
    ("elastic-content-api-timeouts", ContentApiMetrics.ElasticHttpTimeoutCountMetric.getAndReset.toDouble),
    ("solr-content-api-timeouts", ContentApiMetrics.HttpTimeoutCountMetric.getAndReset.toDouble),
    ("content-api-404", ContentApiMetrics.ContentApi404Metric.getAndReset.toDouble),
    ("content-api-client-parse-exceptions", ContentApiMetrics.ContentApiJsonParseExceptionMetric.getAndReset.toDouble),
    ("content-api-client-mapping-exceptions", ContentApiMetrics.ContentApiJsonMappingExceptionMetric.getAndReset.toDouble),
    ("content-api-invalid-content-exceptions", FaciaToolMetrics.InvalidContentExceptionMetric.getAndReset.toDouble),
    ("s3-client-exceptions", S3Metrics.S3ClientExceptionsMetric.getAndReset.toDouble),
    ("content-api-seo-request-success", FaciaToolMetrics.ContentApiSeoRequestSuccess.getAndReset.toDouble),
    ("content-api-seo-request-failure", FaciaToolMetrics.ContentApiSeoRequestFailure.getAndReset.toDouble),
    ("content-api-fallbacks", FaciaToolMetrics.MemcachedFallbackMetric.getAndReset.toDouble)
  )

  private def getTotalPressSuccessCount: Long =
    FaciaToolMetrics.FrontPressLiveSuccess.getValue() + FaciaToolMetrics.FrontPressDraftSuccess.getValue()

  private def getTotalPressFailureCount: Long =
    FaciaToolMetrics.FrontPressLiveFailure.getValue() + FaciaToolMetrics.FrontPressDraftFailure.getValue()

  override def onLoadConfig(config: Configuration, path: File, classloader: ClassLoader, mode: Mode.Mode): Configuration = {
    val newConfig: Configuration = if (mode == Mode.Dev) config ++ devConfig else config
    super.onLoadConfig(newConfig, path, classloader, mode)
  }

  def scheduleJobs() {
    Jobs.schedule("FaciaToolPressJob", "0/10 * * * * ?") {
      FrontPressJob.run()
    }
  }

  def descheduleJobs() {
    Jobs.deschedule("FaciaToolPressJob")
  }

  override def onStart(app: play.api.Application) {
    super.onStart(app)
    descheduleJobs()
    scheduleJobs()
  }

  override def onStop(app: play.api.Application) {
    descheduleJobs()
    super.onStop(app)
  }

}