package rugby.jobs

import common.{AkkaAgent, ExecutionContexts, Logging}
import org.joda.time.format.{DateTimeFormat, DateTimeFormatter}
import rugby.feed.{OptaFeed, RugbyOptaFeedException}
import rugby.model.Match
import scala.concurrent.Future

object RugbyStatsJob extends RugbyStatsJob

trait RugbyStatsJob extends ExecutionContexts with Logging {
  protected val liveScoreMatches = AkkaAgent[Map[String, Match]](Map.empty)
  protected val fixturesAndResultsMatches = AkkaAgent[Map[String, Match]](Map.empty)
  val dateFormat: DateTimeFormatter = DateTimeFormat.forPattern("yyyy/MM/dd")

  def run() {
    sendLiveScores(OptaFeed.getLiveScores)
    fixturesAndResults(OptaFeed.getFixturesAndResults)
  }

  def sendLiveScores(scoreData: Future[Seq[Match]]) : Future[Any] = {
    scoreData.flatMap { matches =>
      Future.sequence(matches.map { aMatch =>
        val date = dateFormat.print(aMatch.date)
        val key = createKey(aMatch, date)
        liveScoreMatches.alter {_ + (key -> aMatch)}
      })
    }.recover {
      case optaFeedException: RugbyOptaFeedException => log.warn(s"RugbyStatsJob encountered errors: ${optaFeedException.message}")
      case error: Exception => log.warn(error.getMessage)
    }
  }

  def fixturesAndResults(fixturesAndResults: Future[Seq[Match]]) : Future[Any] = {
    fixturesAndResults.flatMap { matches =>
      Future.sequence(matches.map { aMatch =>
        val date = dateFormat.print(aMatch.date)
        val key = createKey(aMatch, date)
        fixturesAndResultsMatches.alter {_ +  (key -> aMatch)}
      })
    }.recover {
      case optaFeedException: RugbyOptaFeedException => log.warn(s"RugbyStatsJob encountered errors: ${optaFeedException.message}")
      case error: Exception => log.warn(error.getMessage)
    }
  }

  private def createKey(aMatch: Match, date: String): String = {
    s"$date/${aMatch.homeTeam.id}/${aMatch.awayTeam.id}"
  }

  def getLiveScore(year: String, month: String, day: String, team1: String, team2: String) = {
    liveScoreMatches.get.values.find { rugbyMatch =>
      isValidMatch(year, month, day, team1, team2, rugbyMatch)
    }
  }

  def getFixturesAndResultScore(year: String, month: String, day: String, homeTeamId: String, awayTeamId: String) = {
    fixturesAndResultsMatches.get.values.find { rugbyMatch =>
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
