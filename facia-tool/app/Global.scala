import common.{FaciaToolMetrics, CloudWatchApplicationMetrics, FaciaMetrics, Jobs}
import conf.Management
import frontpress.FaciaToolConfigAgent
import java.io.File
import jobs.FrontPressJob
import play.api._
import services.FaciaToolLifecycle

object Global extends FaciaToolLifecycle with GlobalSettings with CloudWatchApplicationMetrics {

  lazy val devConfig = Configuration.from(Map("session.secure" -> "false"))

  override lazy val applicationName = Management.applicationName
  override def applicationMetrics: Map[String, Double] = Map(
    ("api-usage", FaciaToolMetrics.ApiUsageCount.getAndReset.toDouble),
    ("api-proxy-usage", FaciaToolMetrics.ProxyCount.getAndReset.toDouble),
    ("content-api-put-failure", FaciaToolMetrics.ContentApiPutFailure.getAndReset.toDouble),
    ("content-api-put-success", FaciaToolMetrics.ContentApiPutSuccess.getAndReset.toDouble),
    ("draft-publish", FaciaToolMetrics.DraftPublishCount.getAndReset.toDouble),
    ("auth-expired", FaciaToolMetrics.ExpiredRequestCount.getAndReset.toDouble),
    ("front-press-failure", FaciaToolMetrics.FrontPressFailure.getAndReset.toDouble),
    ("front-press-success", FaciaToolMetrics.FrontPressSuccess.getAndReset.toDouble)
  )

  override def onLoadConfig(config: Configuration, path: File, classloader: ClassLoader, mode: Mode.Mode): Configuration = {
    val newConfig: Configuration = if (mode == Mode.Dev) config ++ devConfig else config
    super.onLoadConfig(newConfig, path, classloader, mode)
  }

  def scheduleJobs() {
    Jobs.schedule("ConfigAgentJob", "0 * * * * ?") {
      FaciaToolConfigAgent.refresh()
    }

    Jobs.schedule("FaciaToolPressJob", "0/10 * * * * ?") {
      FrontPressJob.run()
    }
  }

  def descheduleJobs() {
    Jobs.deschedule("ConfigAgentJob")
    Jobs.deschedule("FaciaToolPressJob")
  }

  override def onStart(app: play.api.Application) {
    super.onStart(app)
    descheduleJobs()
    scheduleJobs()
    FaciaToolConfigAgent.refresh()
  }

  override def onStop(app: play.api.Application) {
    descheduleJobs()
    super.onStop(app)
  }

}