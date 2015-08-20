package rugby.jobs

import common.{Jobs, AkkaAgent, ExecutionContexts, Logging}
import org.joda.time.format.{DateTimeFormat, DateTimeFormatter}
import rugby.feed.{OptaFeed, RugbyOptaFeedException}
import rugby.model.Match

object RugbyStatsJob extends ExecutionContexts with Logging {
  private val liveScoreMatches = AkkaAgent[Seq[Match]](Seq.empty)
  private val fixturesAndResultsMatches = AkkaAgent[Seq[Match]](Seq.empty)
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
        liveScoreMatches.send {_ :+ aMatch}
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
        fixturesAndResultsMatches.send {_ :+ aMatch}
      }
    }.recover {
      case optaFeedException: RugbyOptaFeedException => log.warn(s"RugbyStatsJob encountered errors: ${optaFeedException.message}")
      case error: Exception => log.warn(error.getMessage)
    }
  }

  def getLiveScore(year: String, month: String, day: String, team1: String, team2: String) = {
    liveScoreMatches.get.find { rugbyMatch =>
      isValidMatch(year, month, day, team1, team2, rugbyMatch)
    }
  }

  def getFixturesAndResultScore(year: String, month: String, day: String, homeTeamId: String, awayTeamId: String) = {
    fixturesAndResultsMatches.get.find { rugbyMatch =>
      isValidMatch(year, month, day, homeTeamId, awayTeamId, rugbyMatch)
    }

  }

  private def isValidMatch(year: String, month: String, day: String, team1: String, team2: String, rugbyMatch: Match): Boolean = {
    rugbyMatch.hasTeam(team1) && rugbyMatch.hasTeam(team2) && dateFormat.print(rugbyMatch.date) == s"$year/$month/$day"
  }

  private object Date {
    private val dateTimeParser = DateTimeFormat.forPattern("yyyy/MM/dd")

    def apply(dateTime: String) = dateTimeParser.parseDateTime(dateTime)
  }

}
