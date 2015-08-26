package rugby.jobs

import common.{AkkaAgent, ExecutionContexts, Logging}
import rugby.feed.{MatchNavigation, OptaFeed, RugbyOptaFeedException}
import rugby.model.{Status, Match}
import scala.concurrent.Future

object RugbyStatsJob extends RugbyStatsJob

trait RugbyStatsJob extends ExecutionContexts with Logging {
  protected val liveScoreMatches = AkkaAgent[Map[String, Match]](Map.empty)
  protected val fixturesAndResultsMatches = AkkaAgent[Map[String, Match]](Map.empty)
  protected val matchNavContent = AkkaAgent[Map[String, MatchNavigation]](Map.empty)

  def run() {
    sendLiveScores(OptaFeed.getLiveScores)
    fixturesAndResults(OptaFeed.getFixturesAndResults)
  }

  def sendLiveScores(scoreData: Future[Seq[Match]]) : Future[Any] = {
    scoreData.flatMap { matches =>
      Future.sequence(matches.map { aMatch =>

        liveScoreMatches.alter {_ + (aMatch.key -> aMatch)}
      })
    }.recover {
      case optaFeedException: RugbyOptaFeedException => log.warn(s"RugbyStatsJob encountered errors: ${optaFeedException.message}")
      case error: Exception => log.warn(error.getMessage)
    }
  }

  def fixturesAndResults(fixturesAndResults: Future[Seq[Match]]) : Future[Any] = {
    fixturesAndResults.flatMap { matches =>
      Future.sequence(matches.map { aMatch =>
        fixturesAndResultsMatches.alter {_ +  (aMatch.key -> aMatch)}
      })
    }.recover {
      case optaFeedException: RugbyOptaFeedException => log.warn(s"RugbyStatsJob encountered errors: ${optaFeedException.message}")
      case error: Exception => log.warn(error.getMessage)
    }
  }

  def sendMatchArticles(navigationArticles: Future[Map[String, MatchNavigation]]) = {
    navigationArticles.flatMap { matches =>
      Future.sequence(matches.map { matchItem =>
        matchNavContent.alter { _ + matchItem }
      })
    }
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

  def getAllResults(): Seq[Match] = {
    fixturesAndResultsMatches.get.values.toList.filter(_.status == Status.Result) ++
    liveScoreMatches.get.values.toList.filter(_.status == Status.Result)
  }

  def getMatchNavContent(rugbyMatch: Match): Option[MatchNavigation] = {
    matchNavContent.get.get(rugbyMatch.key)
  }

  private def isValidMatch(year: String, month: String, day: String, team1: String, team2: String, rugbyMatch: Match): Boolean = {
    rugbyMatch.hasTeam(team1) && rugbyMatch.hasTeam(team2) && Match.dateFormat.print(rugbyMatch.date) == s"$year/$month/$day"
  }
}
