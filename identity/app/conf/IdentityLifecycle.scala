package conf

import app.LifecycleComponent
import common.{JobScheduler, AkkaAsync}
import jobs.TorExitNodeList
import model.PhoneNumbers
import play.api.inject.ApplicationLifecycle

import scala.concurrent.{Future, ExecutionContext}

class IdentityLifecycle(
    appLifecycle: ApplicationLifecycle,
    akkaAsync: AkkaAsync,
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

    akkaAsync.after1s {
      TorExitNodeList.run()
      PhoneNumbers
    }
  }
}
