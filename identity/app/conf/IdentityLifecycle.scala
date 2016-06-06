package conf

import common.{LifecycleComponent, AkkaAsync, Jobs}
import jobs.{TorExitNodeList, BlockedEmailDomainList}
import model.PhoneNumbers
import play.api.inject.ApplicationLifecycle

import scala.concurrent.{Future, ExecutionContext}

class IdentityLifecycle(appLifecycle: ApplicationLifecycle)(implicit ec: ExecutionContext) extends LifecycleComponent {

  appLifecycle.addStopHook { () => Future {
    descheduleJobs()
  }}

  private def scheduleJobs() {
      Jobs.schedule("BlockedEmailsRefreshJobs", "0 0/30 * * * ?") {
         BlockedEmailDomainList.run()
      }

      Jobs.schedule("TorExitNodeRefeshJob","0 0/30 * * * ?" ) {
         TorExitNodeList.run()
      }
  }

  private def descheduleJobs() {
    Jobs.deschedule("BlockedEmailsRefreshJobs")
    Jobs.deschedule("TorExitNodeRefeshJob")
  }

  override def start(): Unit = {
    descheduleJobs()
    scheduleJobs()

    AkkaAsync {
      BlockedEmailDomainList.run()
      TorExitNodeList.run()
      PhoneNumbers
    }
  }
}
