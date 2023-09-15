package conf

import app.LifecycleComponent
import common.{JobScheduler, PekkoAsync}
import jobs.TorExitNodeList
import model.PhoneNumbers
import play.api.inject.ApplicationLifecycle

import scala.concurrent.{Future, ExecutionContext}

class IdentityLifecycle(
    appLifecycle: ApplicationLifecycle,
    pekkoAsync: PekkoAsync,
    jobs: JobScheduler,
)(implicit ec: ExecutionContext)
    extends LifecycleComponent {

  appLifecycle.addStopHook { () =>
    Future {
      descheduleJobs()
    }
  }

  private def scheduleJobs(): Unit = {
    jobs.schedule("TorExitNodeRefeshJob", "0 0/30 * * * ?") {
      TorExitNodeList.run()
    }
  }

  private def descheduleJobs(): Unit = {
    jobs.deschedule("TorExitNodeRefeshJob")
  }

  override def start(): Unit = {
    descheduleJobs()
    scheduleJobs()

    pekkoAsync.after1s {
      TorExitNodeList.run()
      PhoneNumbers
    }
  }
}
