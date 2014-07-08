import common.Jobs
import conf.{Configuration => GuardianConfiguration}
import frontpress.{ToolPressQueueWorker, FrontPressCron}
import play.api.GlobalSettings
import services.ConfigAgentLifecycle

object Global extends GlobalSettings with ConfigAgentLifecycle {
  val pressJobConsumeRateInSeconds: Int = GuardianConfiguration.faciatool.pressJobConsumeRateInSeconds
  /** TODO add CloudWatch metrics here */

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
