package conf

import common.{AkkaAsync, Jobs, ExecutionContexts}
import play.api.{Plugin, Application}
import jobs.{TorExitNodeList, BlockedEmailDomainList}
import scala.concurrent.duration._

/**
 * Created by nbennett on 21/10/14.
 */
class IdentityJobsPlugin(app: Application) extends Plugin with ExecutionContexts {

  def scheduleJobs() {
      Jobs.schedule("BlockedEmailsRefreshJobs", "0 0/30 * * * ?") {
         BlockedEmailDomainList.run()
      }

      Jobs.schedule("TorExitNodeRefeshJob","0 0/30 * * * ?" ) {
         TorExitNodeList.run()
      }
  }

  def descheduleJobs() {
    Jobs.deschedule("BlockedEmailsRefreshJobs")
    Jobs.deschedule("TorExitNodeRefeshJob")
  }

  override def onStart() {
    descheduleJobs()
    scheduleJobs()

    AkkaAsync.after(5.seconds) {
      BlockedEmailDomainList.run()
      TorExitNodeList.run()
    }
  }

  override def onStop() {
    descheduleJobs()
  }

}
