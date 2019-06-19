package cricket.conf

import app.LifecycleComponent
import common.{JobScheduler, AkkaAsync}
import jobs.CricketStatsJob
import play.api.inject.ApplicationLifecycle
import scala.concurrent.duration._

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
    jobs.scheduleEvery("CricketAgentRefreshCurrentMatches", 15.seconds) {
      Future(cricketStatsJob.run(cricketStatsJob.paFeed.getCurrentMatchIds))
    }
    jobs.scheduleEvery("CricketAgentRefreshHistoricalMatches", 10.minutes) {
      Future(cricketStatsJob.run(cricketStatsJob.paFeed.getHistoricalMatchIds))
    }
  }

  private def descheduleJobs() {
    jobs.deschedule("CricketAgentRefreshCurrentMatches")
    jobs.deschedule("CricketAgentRefreshHistoricalMatches")
  }

  override def start() {
    descheduleJobs()
    scheduleJobs()

    // ensure that we populate the cricket stats cache immediately
    akkaAsync.after1s {
      cricketStatsJob.run(cricketStatsJob.paFeed.getHistoricalMatchIds)
    }
  }
}
