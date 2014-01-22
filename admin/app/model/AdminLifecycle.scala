package model

import play.api.{Application => PlayApp, GlobalSettings}
import tools.CloudWatch
import common.Jobs

trait AdminLifecycle extends GlobalSettings {

  private def scheduleJobs() {
    Jobs.schedule("AdminLoadJob", "0/30 * * * * ?") {
      model.abtests.AbTestJob.run()
    }
  }

  private def descheduleJobs() {
    Jobs.deschedule("AdminLoadJob")
  }

  override def onStart(app: play.api.Application) {
    super.onStart(app)
    descheduleJobs()
    scheduleJobs()
  }

  override def onStop(app: play.api.Application) {
    descheduleJobs()
    CloudWatch.shutdown()
    super.onStop(app)
  }
}
