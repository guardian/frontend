package cricket.conf

import app.LifecycleComponent
import common.{JobScheduler, AkkaAsync}
import jobs.CricketStatsJob
import play.api.inject.ApplicationLifecycle

import scala.concurrent.{Future, ExecutionContext}

class CricketLifecycle(
  appLifeCycle: ApplicationLifecycle,
  jobs: JobScheduler,
  akkaAsync: AkkaAsync,
  cricketStatsJob: CricketStatsJob
)(implicit ec: ExecutionContext) extends LifecycleComponent {

  appLifeCycle.addStopHook { () => Future {
    descheduleJobs()
  }}

  private def scheduleJobs() {
    jobs.schedule("CricketAgentRefreshJob", "0 * * * * ?") {
      cricketStatsJob.run
    }
  }

  private def descheduleJobs() {
    jobs.deschedule("CricketAgentRefreshJob")
  }

  override def start() {
    descheduleJobs()
    scheduleJobs()

    akkaAsync.after1s {
      cricketStatsJob.run
    }
  }
}
