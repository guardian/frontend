package conf

import common.{AkkaAsync, Jobs, ExecutionContexts}
import play.api.{Plugin, Application}
import jobs.BlockedEmailsDomainList
import scala.concurrent.duration._

/**
 * Created by nbennett on 21/10/14.
 */
class BlockedEmailDomainsPlugin(app: Application) extends Plugin with ExecutionContexts {

  def scheduleJobs() {
      Jobs.schedule("BlockedEmailsRefreshJobs", "0 * * * * ?") {
         BlockedEmailsDomainList.run()
      }
  }

  def descheduleJobs() {
    Jobs.deschedule("BlockedEmailsRefreshJobs")
  }

  override def onStart() {
    descheduleJobs()
    scheduleJobs()

    AkkaAsync.after(5.seconds) {
      BlockedEmailsDomainList.run()
    }
  }

  override def onStop() {
    descheduleJobs()
  }

}
