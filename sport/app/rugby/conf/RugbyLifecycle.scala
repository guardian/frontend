package rugby.conf

import app.LifecycleComponent
import common.{PekkoAsync, JobScheduler}
import play.api.inject.ApplicationLifecycle
import rugby.feed.CapiFeed
import rugby.jobs.RugbyStatsJob
import scala.concurrent.ExecutionContext
import scala.concurrent.duration.FiniteDuration
import scala.concurrent.duration._

class RugbyLifecycle(
    appLifeCycle: ApplicationLifecycle,
    jobs: JobScheduler,
    pekkoAsync: PekkoAsync,
    rugbyStatsJob: RugbyStatsJob,
    capiFeed: CapiFeed,
)(implicit ec: ExecutionContext)
    extends LifecycleComponent {

  protected val initializationTimeout: FiniteDuration = 10.seconds

  override def start(): Unit = {
    rugbyStatsJob.fetchFixturesAndResults()

    jobs.deschedule("FixturesAndResults")
    jobs.schedule("FixturesAndResults", "30 * * * * ?") {
      rugbyStatsJob.fetchFixturesAndResults()
    }

    jobs.deschedule("MatchNavArticles")
    jobs.schedule("MatchNavArticles", "35 0/30 * * * ?") {
      val refreshedNavContent = capiFeed.getMatchArticles(rugbyStatsJob.getAllResults())
      rugbyStatsJob.sendMatchArticles(refreshedNavContent)
    }

    pekkoAsync.after1s {
      rugbyStatsJob.fetchFixturesAndResults()
    }

    //delay to allow previous jobs to complete
    pekkoAsync.after(initializationTimeout) {
      val refreshedNavContent = capiFeed.getMatchArticles(rugbyStatsJob.getAllResults())
      rugbyStatsJob.sendMatchArticles(refreshedNavContent)
    }
  }
}
