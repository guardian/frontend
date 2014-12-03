package contentapi

import common.{Logging, Jobs}
import play.api.GlobalSettings

trait SectionsLookUpLifecycle extends GlobalSettings with Logging  {
  private def scheduleJobs() {
    Jobs.schedule("SectionsLookUpJob", "0 * * * * ?") {
      SectionsLookUp.refresh()
    }
  }

  private def descheduleJobs() {
    Jobs.deschedule("SectionsLookUpJob")
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
