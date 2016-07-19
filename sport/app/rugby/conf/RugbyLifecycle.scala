package rugby.conf

import app.LifecycleComponent
import common.{JobScheduler, AkkaAsync}
import play.api.inject.ApplicationLifecycle
import rugby.feed.{CapiFeed, OptaFeed}
import rugby.jobs.RugbyStatsJob

import scala.concurrent.ExecutionContext
import scala.concurrent.duration.FiniteDuration
import scala.concurrent.duration._

class RugbyLifecycle(
  appLifeCycle: ApplicationLifecycle,
  jobs: JobScheduler,
  akkaAsync: AkkaAsync
)(implicit ec: ExecutionContext) extends LifecycleComponent {

  protected val initializationTimeout: FiniteDuration = 10.seconds

  override def start(): Unit = {
    jobs.deschedule("FixturesAndResults")
    jobs.schedule("FixturesAndResults", "5 0/30 * * * ?") {
      RugbyStatsJob.fixturesAndResults(OptaFeed.getFixturesAndResults)
    }

    jobs.deschedule("GroupTables")
    jobs.schedule("GroupTables", "10 0/30 * * * ?") {
      RugbyStatsJob.groupTables(OptaFeed.getGroupTables)
    }


    jobs.deschedule("PastEventScores")
    jobs.schedule("PastEventScores", "20 0/30 * * * ?") {
      RugbyStatsJob.fetchPastScoreEvents
    }

    jobs.deschedule("PastMatchesStat")
    jobs.schedule("PastMatchesStat", "30 0/30 * * * ?") {
      RugbyStatsJob.fetchPastMatchesStat
    }


    jobs.deschedule("MatchNavArticles")
    jobs.schedule("MatchNavArticles", "35 0/30 * * * ?") {
      RugbyStatsJob.sendMatchArticles(CapiFeed.getMatchArticles())
    }

    akkaAsync.after1s {
      RugbyStatsJob.fixturesAndResults(OptaFeed.getFixturesAndResults)
      RugbyStatsJob.groupTables(OptaFeed.getGroupTables)
    }

    //delay to allow previous jobs to complete
    akkaAsync.after(initializationTimeout) {
      RugbyStatsJob.fetchPastScoreEvents
      RugbyStatsJob.fetchPastMatchesStat
      RugbyStatsJob.sendMatchArticles(CapiFeed.getMatchArticles())
    }
  }
}
