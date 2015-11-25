package conf

import common.{AkkaAsync, Jobs, ExecutionContexts}
import jobs.{TorExitNodeList, BlockedEmailDomainList}
import play.api.GlobalSettings

trait IdentityLifecycle extends GlobalSettings with ExecutionContexts {

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

  override def onStart(app: play.api.Application) {
    super.onStart(app)
    descheduleJobs()
    scheduleJobs()

    AkkaAsync {
      BlockedEmailDomainList.run()
      TorExitNodeList.run()
    }
  }

  override def onStop(app: play.api.Application) {
    descheduleJobs()
    super.onStop(app)
  }

}
