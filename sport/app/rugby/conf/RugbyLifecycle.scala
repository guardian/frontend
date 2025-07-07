package rugby.conf

import app.LifecycleComponent
import common.{JobScheduler, PekkoAsync}
import model.ApplicationContext
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
)(implicit ec: ExecutionContext, context: ApplicationContext)
    extends LifecycleComponent {

  protected val initializationTimeout: FiniteDuration = 10.seconds

  override def start(): Unit = {
    rugbyStatsJob.fetchFixturesAndResults()

    jobs.deschedule("FixturesAndResults")
    // if preview "Every hour at 50 minutes" (e.g., 1:50, 2:50, 3:50)
    // otherwise "At 30 seconds past the minute, every minute" (e.g., 00:30, 01:30, 02:30, etc.)
    jobs.schedule("FixturesAndResults", if (context.isPreview) "0 50 * * * ?" else "30 * * * * ?") {
      rugbyStatsJob.fetchFixturesAndResults()
    }

    jobs.deschedule("MatchNavArticles")
    // if preview "Every hour at 55 minutes" (e.g., 1:55, 2:55, 3:55)
    // otherwise "At 35 seconds past the minute, every 30 minutes" (e.g., 00:35, 00:05, 01:35, 01:05, etc.)
    jobs.schedule("MatchNavArticles", if (context.isPreview) "0 55 * * * ?" else "35 0/30 * * * ?") {
      val refreshedNavContent = capiFeed.getMatchArticles(rugbyStatsJob.getAllResults())
      rugbyStatsJob.sendMatchArticles(refreshedNavContent)
    }

    pekkoAsync.after1s {
      rugbyStatsJob.fetchFixturesAndResults()
    }

    // delay to allow previous jobs to complete
    pekkoAsync.after(initializationTimeout) {
      val refreshedNavContent = capiFeed.getMatchArticles(rugbyStatsJob.getAllResults())
      rugbyStatsJob.sendMatchArticles(refreshedNavContent)
    }
  }
}
