import java.io.File

import common._
import conf.{Gzipper, Configuration => GuardianConfiguration}
import play.api._
import play.api.mvc.WithFilters
import services.ConfigAgentLifecycle

object Global extends WithFilters(Gzipper)
  with GlobalSettings
  with CloudWatchApplicationMetrics
  with ConfigAgentLifecycle {
  lazy val devConfig = Configuration.from(Map("session.secure" -> "false"))

  override lazy val applicationName = "frontend-facia-tool"
  override def applicationMetrics: Map[String, Double] = Map(
    ("api-usage", FaciaToolMetrics.ApiUsageCount.getAndReset.toDouble),
    ("api-proxy-usage", FaciaToolMetrics.ProxyCount.getAndReset.toDouble),
    ("content-api-put-failure", FaciaToolMetrics.ContentApiPutFailure.getAndReset.toDouble),
    ("content-api-put-success", FaciaToolMetrics.ContentApiPutSuccess.getAndReset.toDouble),
    ("draft-publish", FaciaToolMetrics.DraftPublishCount.getAndReset.toDouble),
    ("auth-expired", FaciaToolMetrics.ExpiredRequestCount.getAndReset.toDouble),
    ("elastic-content-api-calls", ContentApiMetrics.ElasticHttpTimingMetric.getAndReset.toDouble),
    ("elastic-content-api-timeouts", ContentApiMetrics.ElasticHttpTimeoutCountMetric.getAndReset.toDouble),
    ("content-api-404", ContentApiMetrics.ContentApi404Metric.getAndReset.toDouble),
    ("content-api-client-parse-exceptions", ContentApiMetrics.ContentApiJsonParseExceptionMetric.getAndReset.toDouble),
    ("content-api-client-mapping-exceptions", ContentApiMetrics.ContentApiJsonMappingExceptionMetric.getAndReset.toDouble),
    ("content-api-invalid-content-exceptions", FaciaToolMetrics.InvalidContentExceptionMetric.getAndReset.toDouble),
    ("s3-client-exceptions", S3Metrics.S3ClientExceptionsMetric.getAndReset.toDouble)
  )

  def secureCookie(mode: Mode.Mode): Boolean = mode == Mode.Dev || GuardianConfiguration.environment.stage == "dev"

  override def onLoadConfig(config: Configuration, path: File, classloader: ClassLoader, mode: Mode.Mode): Configuration = {
    val newConfig: Configuration = if (secureCookie(mode)) config ++ devConfig else config
    super.onLoadConfig(newConfig, path, classloader, mode)
  }
}