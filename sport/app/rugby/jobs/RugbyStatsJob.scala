package rugby.jobs

import common.{Jobs, AkkaAgent, ExecutionContexts, Logging}
import org.joda.time.format.{DateTimeFormat, DateTimeFormatter}
import rugby.feed.{OptaFeed, RugbyOptaFeedException}
import rugby.model.LiveScore

object RugbyStatsJob extends ExecutionContexts with Logging {
  private val rugbyStatsAgent = AkkaAgent[Map[String, LiveScore]](Map.empty)
  val dateFormat: DateTimeFormatter = DateTimeFormat.forPattern("yyyy/MM/dd")


  def run() {

    OptaFeed.getLiveScores.map { liveScores =>
      liveScores.map { liveScore =>
        val date = dateFormat.print(liveScore.date)
        val key = s"$date/${liveScore.homeTeam.id}/${liveScore.awayTeam.id}"
        rugbyStatsAgent.send{_ + (key -> liveScore)}
      }

    }.recover {
      case optaFeedException: RugbyOptaFeedException => log.warn(s"RugbyStatsJob encountered errors: ${optaFeedException.message}")
      case error: Exception => log.warn(error.getMessage)
    }
  }

  def getLiveScore(key: String) = rugbyStatsAgent.get.get(key)

}
