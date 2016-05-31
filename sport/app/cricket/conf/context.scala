package cricket.conf

import common.{LifecycleComponent, AkkaAsync, Jobs}
import jobs.CricketStatsJob
import play.api.inject.ApplicationLifecycle

import scala.concurrent.{Future, ExecutionContext}

class CricketLifecycle(appLifeCycle: ApplicationLifecycle)(implicit ec: ExecutionContext) extends LifecycleComponent {

  appLifeCycle.addStopHook { () => Future {
    descheduleJobs()
  }}

  private def scheduleJobs() {
    Jobs.schedule("CricketAgentRefreshJob", "0 * * * * ?") {
      CricketStatsJob.run()
    }
  }

  private def descheduleJobs() {
    Jobs.deschedule("CricketAgentRefreshJob")
  }

  override def start() {
    descheduleJobs()
    scheduleJobs()

    AkkaAsync {
      CricketStatsJob.run()
    }
  }
}
