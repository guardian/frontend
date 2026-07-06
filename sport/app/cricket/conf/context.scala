package cricket.conf

import app.LifecycleComponent
import common.{JobScheduler, PekkoAsync}
import jobs.CricketStatsJob
import model.ApplicationContext

import java.time.LocalDateTime
import play.api.inject.ApplicationLifecycle

import scala.concurrent.duration._
import scala.concurrent.{ExecutionContext, Future}
import conf.cricketPa.PaFeed

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
    // Refresh the fixtures/results registry once a day.
    jobs.scheduleEvery("CricketDiscoverMatches", 1.day) {
      Future(
        cricketStatsJob.discoverMatches(
          fromDate = LocalDateTime.now.minusMonths(PaFeed.dateWindowMonths),
          toDate = LocalDateTime.now.plusMonths(PaFeed.dateWindowMonths),
        ),
      )
    }

    // Ensure cache is updated when cold or when new matches are discovered.
    jobs.scheduleEvery("CricketBackfillMatches", if (context.isPreview) 1.hour else 5.minutes) {
      Future(cricketStatsJob.backfillMatches())
    }

    // Fetch active matches every 5 minutes to ensure the scorecard is up to date.
    jobs.scheduleEvery("CricketActiveMatches", if (context.isPreview) 1.hour else 5.minutes) {
      Future(cricketStatsJob.refreshActiveMatchData())
    }

    // Fetch upcoming matches every hour.
    jobs.scheduleEvery("CricketUpcomingMatches", 1.hour) {
      Future(cricketStatsJob.refreshUpcomingMatchData())
    }
  }

  private def descheduleJobs(): Unit = {
    jobs.deschedule("CricketDiscoverMatches")
    jobs.deschedule("CricketBackfillMatches")
    jobs.deschedule("CricketActiveMatches")
    jobs.deschedule("CricketUpcomingMatches")
  }

  override def start(): Unit = {
    descheduleJobs()
    scheduleJobs()

    // ensure that we populate the cricket stats cache immediately
    pekkoAsync.after1s {
      cricketStatsJob
        .discoverMatches(
          fromDate = LocalDateTime.now.minusMonths(PaFeed.dateWindowMonths),
          toDate = LocalDateTime.now.plusMonths(PaFeed.dateWindowMonths),
        )
        .andThen { case _ => cricketStatsJob.backfillMatches() }
    }
  }
}
