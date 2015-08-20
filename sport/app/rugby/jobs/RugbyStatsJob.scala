package rugby.jobs

import common.{Jobs, AkkaAgent, ExecutionContexts, Logging}
import org.joda.time.format.{DateTimeFormat, DateTimeFormatter}
import rugby.feed.{OptaFeed, RugbyOptaFeedException}
import rugby.model.Match

object RugbyStatsJob extends ExecutionContexts with Logging {
  private val liveScoreMatches = AkkaAgent[Map[String, Match]](Map.empty)
  private val fixturesAndResultsMatches = AkkaAgent[Map[String, Match]](Map.empty)
  val dateFormat: DateTimeFormatter = DateTimeFormat.forPattern("yyyy/MM/dd")


  def run() {

    liveScores
    fixturesAndResults
  }

  def liveScores {
    OptaFeed.getLiveScores.map { matches =>
      matches.map { aMatch =>
        val date = dateFormat.print(aMatch.date)
        val key = s"$date/${aMatch.homeTeam.id}/${aMatch.awayTeam.id}"
        liveScoreMatches.send {
          _ + (key -> aMatch)
        }
      }

    }.recover {
      case optaFeedException: RugbyOptaFeedException => log.warn(s"RugbyStatsJob encountered errors: ${optaFeedException.message}")
      case error: Exception => log.warn(error.getMessage)
    }
  }

  def fixturesAndResults {
    OptaFeed.getFixturesAndResults.map { matches =>
      matches.map { aMatch =>
        val date = dateFormat.print(aMatch.date)
        val key = s"$date/${aMatch.homeTeam.id}/${aMatch.awayTeam.id}"
        fixturesAndResultsMatches.send {
          _ + (key -> aMatch)
        }
      }
    }.recover {
      case optaFeedException: RugbyOptaFeedException => log.warn(s"RugbyStatsJob encountered errors: ${optaFeedException.message}")
      case error: Exception => log.warn(error.getMessage)
    }
  }

  def getLiveScore(key: String) = liveScoreMatches.get.get(key)
  def getFixturesAndResultScore(key: String) = fixturesAndResultsMatches.get.get(key)

}
