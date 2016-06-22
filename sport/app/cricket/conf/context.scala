package cricket.conf

import common.{JobScheduler, LifecycleComponent, AkkaAsync, Jobs}
import jobs.CricketStatsJob
import play.api.inject.ApplicationLifecycle

import scala.concurrent.{Future, ExecutionContext}

class CricketLifecycle(
  appLifeCycle: ApplicationLifecycle,
  jobs: JobScheduler = Jobs,
  akkaAsync: AkkaAsync = AkkaAsync
)(implicit ec: ExecutionContext) extends LifecycleComponent {

  appLifeCycle.addStopHook { () => Future {
    descheduleJobs()
  }}

  private def scheduleJobs() {
    jobs.schedule("CricketAgentRefreshJob", "0 * * * * ?") {
      CricketStatsJob.run()
    }
  }

  private def descheduleJobs() {
    jobs.deschedule("CricketAgentRefreshJob")
  }

  override def start() {
    descheduleJobs()
    scheduleJobs()

    akkaAsync.after1s {
      CricketStatsJob.run()
    }
  }
}
