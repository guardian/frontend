package contentapi

import common.{LifecycleComponent, AkkaAsync, Logging, Jobs}
import play.api.inject.ApplicationLifecycle

import scala.concurrent.{Future, ExecutionContext}

class SectionsLookUpLifecycle(appLifecycle: ApplicationLifecycle)(implicit ec: ExecutionContext) extends LifecycleComponent with Logging {

  appLifecycle.addStopHook { () => Future {
    descheduleJobs()
  }}

  private def scheduleJobs() {
    Jobs.schedule("SectionsLookUpJob", "0 * * * * ?") {
      SectionsLookUp.refresh()
    }
  }

  private def descheduleJobs() {
    Jobs.deschedule("SectionsLookUpJob")
  }

  override def start(): Unit = {
    descheduleJobs()
    scheduleJobs()

    AkkaAsync {
      SectionsLookUp.refresh()
    }
  }
}
