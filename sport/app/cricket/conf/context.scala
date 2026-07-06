package cricket.conf

import app.LifecycleComponent
import common.{JobScheduler, PekkoAsync}
import jobs.CricketStatsJob
import jobs.CricketStatsJob.MatchType
import model.ApplicationContext

import java.time.LocalDateTime
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

  // We only keep 2 months of historical matches in the cache.
  private val discoveryLookBack = 2 // months

  private def scheduleJobs(): Unit = {
    // Discover matches and load any newly seen match
    jobs.scheduleEvery("CricketDiscoverMatches", 1.day) {
      Future(cricketStatsJob.discoverMatches(fromDate = LocalDateTime.now.minusMonths(discoveryLookBack)))
    }

    // Refresh match data for upcoming (not-yet-started) fixtures. Hourly.
    jobs.scheduleEvery("CricketRefreshUpcomingMatches", 1.hour) {
      Future(cricketStatsJob.refreshUpcomingMatchData())
    }
    // Frequent refresh for near/live/recently-started matches.
    jobs.scheduleEvery("CricketRefreshLiveMatches", if (context.isPreview) 1.hour else 5.minutes) {
      Future(cricketStatsJob.refreshActiveMatchData())
    }
  }

  private def descheduleJobs(): Unit = {
    jobs.deschedule("CricketDiscoverMatches")
    jobs.deschedule("CricketRefreshUpcomingMatches")
    jobs.deschedule("CricketRefreshLiveMatches")
  }

  override def start(): Unit = {
    descheduleJobs()
    scheduleJobs()

    // ensure that we populate the cricket stats cache immediately
    pekkoAsync.after1s {
      cricketStatsJob.discoverMatches(fromDate = LocalDateTime.now.minusMonths(discoveryLookBack))
    }
  }
}
