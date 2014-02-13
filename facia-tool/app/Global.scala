import common.Jobs
import frontpress.FaciaToolConfigAgent
import java.io.File
import jobs.FrontPressJob
import play.api._
import services.FaciaToolLifecycle

object Global extends FaciaToolLifecycle with GlobalSettings {

  lazy val devConfig = Configuration.from(Map("session.secure" -> "false"))

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