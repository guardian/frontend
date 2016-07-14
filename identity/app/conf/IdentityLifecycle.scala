package conf

import app.LifecycleComponent
import common.{JobScheduler, AkkaAsync}
import jobs.{TorExitNodeList, BlockedEmailDomainList}
import model.PhoneNumbers
import play.api.inject.ApplicationLifecycle

import scala.concurrent.{Future, ExecutionContext}

class IdentityLifecycle(
  appLifecycle: ApplicationLifecycle,
  akkaAsync: AkkaAsync,
  jobs: JobScheduler
)(implicit ec: ExecutionContext) extends LifecycleComponent {

  appLifecycle.addStopHook { () => Future {
    descheduleJobs()
  }}

  private def scheduleJobs() {
    jobs.schedule("BlockedEmailsRefreshJobs", "0 0/30 * * * ?") {
       BlockedEmailDomainList.run()
    }

    jobs.schedule("TorExitNodeRefeshJob","0 0/30 * * * ?" ) {
       TorExitNodeList.run()
    }
  }

  private def descheduleJobs() {
    jobs.deschedule("BlockedEmailsRefreshJobs")
    jobs.deschedule("TorExitNodeRefeshJob")
  }

  override def start(): Unit = {
    descheduleJobs()
    scheduleJobs()

    akkaAsync.after1s {
      BlockedEmailDomainList.run()
      TorExitNodeList.run()
      PhoneNumbers
    }
  }
}
