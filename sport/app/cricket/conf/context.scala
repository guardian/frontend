package cricket.conf

import app.LifecycleComponent
import common.{AkkaAsync, JobScheduler}
import jobs.CricketStatsJob

import java.time.LocalDate
import play.api.inject.ApplicationLifecycle

import scala.concurrent.duration._
import scala.concurrent.{ExecutionContext, Future}

class CricketLifecycle(
    appLifeCycle: ApplicationLifecycle,
    jobs: JobScheduler,
    akkaAsync: AkkaAsync,
    cricketStatsJob: CricketStatsJob,
)(implicit ec: ExecutionContext)
    extends LifecycleComponent {

  appLifeCycle.addStopHook { () =>
    Future {
      descheduleJobs()
    }
  }

  private def scheduleJobs(): Unit = {
    jobs.scheduleEvery("CricketAgentRefreshCurrentMatches", 5.minutes) {
      Future(cricketStatsJob.run(fromDate = LocalDate.now, matchesToFetch = 1))
    }
    jobs.scheduleEvery("CricketAgentRefreshHistoricalMatches", 10.minutes) {
      Future(cricketStatsJob.run(fromDate = LocalDate.now.minusMonths(2), matchesToFetch = 10))
    }
  }

  private def descheduleJobs(): Unit = {
    jobs.deschedule("CricketAgentRefreshCurrentMatches")
    jobs.deschedule("CricketAgentRefreshHistoricalMatches")
  }

  override def start(): Unit = {
    descheduleJobs()
    scheduleJobs()

    // ensure that we populate the cricket stats cache immediately
    akkaAsync.after1s {
      cricketStatsJob.run(fromDate = LocalDate.now.minusMonths(2), matchesToFetch = 10)
    }
  }
}
