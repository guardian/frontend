import java.io.File

import common._
import conf.{Gzipper, Configuration => GuardianConfiguration}
import metrics.FrontendMetric
import play.api._
import play.api.mvc.WithFilters
import services.ConfigAgentLifecycle

object Global extends WithFilters(Gzipper)
  with GlobalSettings
  with CloudWatchApplicationMetrics
  with ConfigAgentLifecycle {
  lazy val devConfig = Configuration.from(Map("session.secure" -> "false"))

  override lazy val applicationName = "frontend-facia-tool"

  override def applicationMetrics: List[FrontendMetric] = super.applicationMetrics ::: List(
    FaciaToolMetrics.ApiUsageCount,
    FaciaToolMetrics.ProxyCount,
    FaciaToolMetrics.ContentApiPutFailure,
    FaciaToolMetrics.ContentApiPutSuccess,
    FaciaToolMetrics.DraftPublishCount,
    FaciaToolMetrics.ExpiredRequestCount,
    ContentApiMetrics.ElasticHttpTimingMetric,
    ContentApiMetrics.ElasticHttpTimeoutCountMetric,
    ContentApiMetrics.ContentApiErrorMetric,
    S3Metrics.S3ClientExceptionsMetric
  )

  def secureCookie(mode: Mode.Mode): Boolean = mode == Mode.Dev || GuardianConfiguration.environment.stage == "dev"

  override def onLoadConfig(config: Configuration, path: File, classloader: ClassLoader, mode: Mode.Mode): Configuration = {
    val newConfig: Configuration = if (secureCookie(mode)) config ++ devConfig else config
    super.onLoadConfig(newConfig, path, classloader, mode)
  }
}
