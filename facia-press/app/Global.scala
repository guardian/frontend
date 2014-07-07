import common.Jobs
import conf.{Configuration => GuardianConfiguration}
import frontpress.FrontPressJob
import play.api.GlobalSettings

object Global extends GlobalSettings {
  val pressJobConsumeRateInSeconds: Int = GuardianConfiguration.faciatool.pressJobConsumeRateInSeconds
  /** TODO add CloudWatch metrics here */

  def scheduleJobs() {
    Jobs.schedule("FaciaToolPressJob", s"0/$pressJobConsumeRateInSeconds * * * * ?") {
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
