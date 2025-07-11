package cricket.conf

import app.LifecycleComponent
import common.{JobScheduler, PekkoAsync}
import jobs.CricketStatsJob
import model.ApplicationContext

import java.time.LocalDate
import play.api.inject.ApplicationLifecycle

import scala.concurrent.duration._
import scala.concurrent.{ExecutionContext, Future}

class CricketLifecycle(
    appLifeCycle: ApplicationLifecycle,
    jobs: JobScheduler,
    pekkoAsync: PekkoAsync,
    cricketStatsJob: CricketStatsJob,
)(implicit ec: ExecutionContext, context: ApplicationContext)
    extends LifecycleComponent {

  appLifeCycle.addStopHook { () =>
    Future {
      descheduleJobs()
    }
  }

  private def scheduleJobs(): Unit = {
    // if preview "Every hour" otherwise "Every 5 minutes"
    jobs.scheduleEvery("CricketAgentRefreshCurrentMatches", if (context.isPreview) 1.hour else 5.minutes) {
      Future(cricketStatsJob.run(fromDate = LocalDate.now, matchesToFetch = 1))
    }
    // if preview "Every hour" otherwise "Every 10 minutes"
    jobs.scheduleEvery("CricketAgentRefreshHistoricalMatches", if (context.isPreview) 1.hour else 10.minutes) {
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
    pekkoAsync.after1s {
      cricketStatsJob.run(fromDate = LocalDate.now.minusMonths(2), matchesToFetch = 10)
    }
  }
}
