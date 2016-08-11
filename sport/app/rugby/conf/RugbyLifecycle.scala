package rugby.conf

import app.LifecycleComponent
import common.{AkkaAsync, JobScheduler}
import play.api.inject.ApplicationLifecycle
import rugby.feed.CapiFeed
import rugby.jobs.RugbyStatsJob
import scala.concurrent.ExecutionContext
import scala.concurrent.duration.FiniteDuration
import scala.concurrent.duration._

class RugbyLifecycle(
  appLifeCycle: ApplicationLifecycle,
  jobs: JobScheduler,
  akkaAsync: AkkaAsync,
  rugbyStatsJob: RugbyStatsJob
)(implicit ec: ExecutionContext) extends LifecycleComponent {

  protected val initializationTimeout: FiniteDuration = 10.seconds

  override def start(): Unit = {
    jobs.deschedule("FixturesAndResults")
    jobs.schedule("FixturesAndResults", "5 0/30 * * * ?") {
      rugbyStatsJob.fetchFixturesAndResults()
    }

    jobs.deschedule("GroupTables")
    jobs.schedule("GroupTables", "10 0/30 * * * ?") {
      rugbyStatsJob.fetchGroupTables()
    }


    jobs.deschedule("PastEventScores")
    jobs.schedule("PastEventScores", "20 0/30 * * * ?") {
      rugbyStatsJob.fetchPastScoreEvents
    }

    jobs.deschedule("PastMatchesStat")
    jobs.schedule("PastMatchesStat", "30 0/30 * * * ?") {
      rugbyStatsJob.fetchPastMatchesStat
    }


    jobs.deschedule("MatchNavArticles")
    jobs.schedule("MatchNavArticles", "35 0/30 * * * ?") {
      val refreshedNavContent = CapiFeed.getMatchArticles(rugbyStatsJob.getAllResults())
      rugbyStatsJob.sendMatchArticles(refreshedNavContent)
    }

    akkaAsync.after1s {
      rugbyStatsJob.fetchFixturesAndResults()
      rugbyStatsJob.fetchGroupTables()
    }

    //delay to allow previous jobs to complete
    akkaAsync.after(initializationTimeout) {
      rugbyStatsJob.fetchPastScoreEvents
      rugbyStatsJob.fetchPastMatchesStat

      val refreshedNavContent = CapiFeed.getMatchArticles(rugbyStatsJob.getAllResults())
      rugbyStatsJob.sendMatchArticles(refreshedNavContent)
    }
  }
}
