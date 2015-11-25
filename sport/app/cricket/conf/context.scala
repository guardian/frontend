package conf

import common.{AkkaAsync, Jobs, ExecutionContexts}
import jobs.CricketStatsJob
import play.api.GlobalSettings

trait CricketLifecycle extends GlobalSettings with ExecutionContexts {

  private def scheduleJobs() {
    Jobs.schedule("CricketAgentRefreshJob", "0 * * * * ?") {
      CricketStatsJob.run()
    }
  }

  private def descheduleJobs() {
    Jobs.deschedule("CricketAgentRefreshJob")
  }

  override def onStart(app: play.api.Application) {
    super.onStart(app)
    descheduleJobs()
    scheduleJobs()

    AkkaAsync {
      CricketStatsJob.run()
    }
  }

  override def onStop(app: play.api.Application) {
    descheduleJobs()
    super.onStop(app)
  }

}
