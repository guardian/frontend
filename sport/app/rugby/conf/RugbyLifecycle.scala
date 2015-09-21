package rugby.conf

import common.{AkkaAsync, ExecutionContexts, Jobs}
import play.api.GlobalSettings
import rugby.feed.{CapiFeed, OptaFeed}
import rugby.jobs.RugbyStatsJob

import scala.concurrent.duration.FiniteDuration
import scala.concurrent.duration._

trait RugbyLifecycle extends GlobalSettings with ExecutionContexts {

  protected val initializationTimeout: FiniteDuration = 3.seconds

  override def onStart(app: play.api.Application) {
    super.onStart(app)
    Jobs.deschedule("MatchDayLiveScores")
    Jobs.schedule("MatchDayLiveScores", "0 * * * * ?") {
      RugbyStatsJob.sendLiveScores(OptaFeed.getLiveScores)
    }

    Jobs.deschedule("FixturesAndResults")
    Jobs.schedule("FixturesAndResults", "5 0/5 * * * ?") {
      RugbyStatsJob.fixturesAndResults(OptaFeed.getFixturesAndResults)
    }

    Jobs.deschedule("GroupTables")
    Jobs.schedule("GroupTables", "10 0/5 * * * ?") {
      RugbyStatsJob.groupTables(OptaFeed.getGroupTables)
    }    

    Jobs.deschedule("LiveEventScores")
    Jobs.schedule("LiveEventScores", "15 * * * * ?") {
      RugbyStatsJob.fetchLiveScoreEvents
    }

    Jobs.deschedule("PastEventScores")
    Jobs.schedule("PastEventScores", "20 0/5 * * * ?") {
      RugbyStatsJob.fetchPastScoreEvents
    }

    Jobs.deschedule("LiveMatchesStat")
    Jobs.schedule("LiveMatchesStat", "25 * * * * ?") {
      RugbyStatsJob.fetchLiveMatchesStat
    }

    Jobs.deschedule("PastMatchesStat")
    Jobs.schedule("PastMatchesStat", "30 0/5 * * * ?") {
      RugbyStatsJob.fetchPastMatchesStat
    }


    Jobs.deschedule("MatchNavArticles")
    Jobs.schedule("MatchNavArticles", "35 0/2 * * * ?") {
      RugbyStatsJob.sendMatchArticles(CapiFeed.getMatchArticles())
    }

    AkkaAsync {
      RugbyStatsJob.sendLiveScores(OptaFeed.getLiveScores)
      RugbyStatsJob.fixturesAndResults(OptaFeed.getFixturesAndResults)
      RugbyStatsJob.groupTables(OptaFeed.getGroupTables)
    }

    //delay to allow previous jobs to complete
    AkkaAsync.after(initializationTimeout) {
      RugbyStatsJob.fetchLiveScoreEvents
      RugbyStatsJob.fetchPastScoreEvents
      RugbyStatsJob.fetchLiveMatchesStat
      RugbyStatsJob.fetchPastMatchesStat
      RugbyStatsJob.sendMatchArticles(CapiFeed.getMatchArticles())
    }
  }
}
