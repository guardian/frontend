package rugby.jobs

import common.{AkkaAgent, ExecutionContexts, Logging}
import rugby.feed.{OptaFeed, RugbyOptaFeedException}
import rugby.model.LiveScore

object RugbyStatsJob extends ExecutionContexts with Logging {

  private val rugbyStatsAgent = AkkaAgent[Seq[LiveScore]](Seq.empty)

  def run() {
    OptaFeed.getLiveScores.map(rugbyStatsAgent.send(_))
      .recover {
        case optaFeedException: RugbyOptaFeedException => log.warn(s"RugbyStatsJob encountered errors: ${optaFeedException.message}")
        case error: Exception => log.warn(error.getMessage)
    }
  }
}
