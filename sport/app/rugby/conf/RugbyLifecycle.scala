package rugby.conf

import common.{LifecycleComponent, AkkaAsync, Jobs}
import play.api.inject.ApplicationLifecycle
import rugby.feed.{CapiFeed, OptaFeed}
import rugby.jobs.RugbyStatsJob

import scala.concurrent.ExecutionContext
import scala.concurrent.duration.FiniteDuration
import scala.concurrent.duration._

class RugbyLifecycle(appLifeCycle: ApplicationLifecycle)(implicit ec: ExecutionContext) extends LifecycleComponent {

  protected val initializationTimeout: FiniteDuration = 10.seconds

  override def start(): Unit = {
    Jobs.deschedule("FixturesAndResults")
    Jobs.schedule("FixturesAndResults", "5 0/30 * * * ?") {
      RugbyStatsJob.fixturesAndResults(OptaFeed.getFixturesAndResults)
    }

    Jobs.deschedule("GroupTables")
    Jobs.schedule("GroupTables", "10 0/30 * * * ?") {
      RugbyStatsJob.groupTables(OptaFeed.getGroupTables)
    }


    Jobs.deschedule("PastEventScores")
    Jobs.schedule("PastEventScores", "20 0/30 * * * ?") {
      RugbyStatsJob.fetchPastScoreEvents
    }

    Jobs.deschedule("PastMatchesStat")
    Jobs.schedule("PastMatchesStat", "30 0/30 * * * ?") {
      RugbyStatsJob.fetchPastMatchesStat
    }


    Jobs.deschedule("MatchNavArticles")
    Jobs.schedule("MatchNavArticles", "35 0/30 * * * ?") {
      RugbyStatsJob.sendMatchArticles(CapiFeed.getMatchArticles())
    }

    AkkaAsync {
      RugbyStatsJob.fixturesAndResults(OptaFeed.getFixturesAndResults)
      RugbyStatsJob.groupTables(OptaFeed.getGroupTables)
    }

    //delay to allow previous jobs to complete
    AkkaAsync.after(initializationTimeout) {
      RugbyStatsJob.fetchPastScoreEvents
      RugbyStatsJob.fetchPastMatchesStat
      RugbyStatsJob.sendMatchArticles(CapiFeed.getMatchArticles())
    }
  }
}
