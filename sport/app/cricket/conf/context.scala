package cricket.conf

import app.LifecycleComponent
import common.{JobScheduler, PekkoAsync}
import jobs.CricketStatsJob
import model.ApplicationContext

import java.time.LocalDate
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
      cricketStatsJob.discoverMatches(
        fromDate = LocalDate.now.minusMonths(PaFeed.dateWindowMonths),
        toDate = LocalDate.now.plusMonths(PaFeed.dateWindowMonths),
      )
    }

    // Fetch active matches every 5 minutes to ensure the scorecard is up to date.
    jobs.scheduleEvery("CricketFrequentMatchUpdates", if (context.isPreview) 1.hour else 5.minutes) {
      cricketStatsJob.frequentMatchDataRefresh()
    }

    // Fetch other matches every hour.
    jobs.scheduleEvery("CricketInfrequentMatchUpdates", 1.hour) {
      cricketStatsJob.infrequentMatchDataRefresh()
    }
  }

  private def descheduleJobs(): Unit = {
    jobs.deschedule("CricketDiscoverMatches")
    jobs.deschedule("CricketFrequentMatchUpdates")
    jobs.deschedule("CricketInfrequentMatchUpdates")
  }

  override def start(): Unit = {
    descheduleJobs()
    scheduleJobs()

    // ensure that we populate the cricket stats cache immediately
    pekkoAsync.after1s {
      cricketStatsJob.discoverMatches(
        fromDate = LocalDate.now.minusMonths(PaFeed.dateWindowMonths),
        toDate = LocalDate.now.plusMonths(PaFeed.dateWindowMonths),
      )
    }
  }
}
