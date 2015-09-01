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
    Jobs.schedule("FixturesAndResults", "0 0/30 * * * ?") {
      RugbyStatsJob.fixturesAndResults(OptaFeed.getFixturesAndResults)
    }

    Jobs.deschedule("LiveEventScores")
    Jobs.schedule("LiveEventScores", "0 * * * * ?") {
      RugbyStatsJob.fetchLiveScoreEvents
    }

    Jobs.deschedule("PastEventScores")
    Jobs.schedule("PastEventScores", "0 0/30 * * * ?") {
      RugbyStatsJob.fetchPastScoreEvents
    }

    Jobs.deschedule("MatchNavArticles")
    Jobs.schedule("MatchNavArticles", "0 0/2 * * * ?") {
      RugbyStatsJob.sendMatchArticles(CapiFeed.getMatchArticles())
    }

    AkkaAsync {
      RugbyStatsJob.sendLiveScores(OptaFeed.getLiveScores)
      RugbyStatsJob.fixturesAndResults(OptaFeed.getFixturesAndResults)
    }

    //delay to allow previous jobs to complete
    AkkaAsync.after(initializationTimeout) {
      RugbyStatsJob.fetchLiveScoreEvents
      RugbyStatsJob.fetchPastScoreEvents
      RugbyStatsJob.sendMatchArticles(CapiFeed.getMatchArticles())
    }
  }
}
