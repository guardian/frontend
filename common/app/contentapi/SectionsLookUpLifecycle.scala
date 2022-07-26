package contentapi

import app.LifecycleComponent
import common._
import play.api.inject.ApplicationLifecycle

import scala.concurrent.{Future, ExecutionContext}

class SectionsLookUpLifecycle(
    appLifecycle: ApplicationLifecycle,
    jobs: JobScheduler,
    akkaAsync: AkkaAsync,
    sectionsLookUp: SectionsLookUp,
)(implicit ec: ExecutionContext)
    extends LifecycleComponent
    with GuLogging {

  appLifecycle.addStopHook { () =>
    Future {
      descheduleJobs()
    }
  }

  private def scheduleJobs(): Unit = {
    jobs.schedule("SectionsLookUpJob", "0 * * * * ?") {
      sectionsLookUp.refresh()
    }
  }

  private def descheduleJobs(): Unit = {
    jobs.deschedule("SectionsLookUpJob")
  }

  override def start(): Unit = {
    descheduleJobs()
    scheduleJobs()

    akkaAsync.after1s {
      sectionsLookUp.refresh()
    }
  }
}
