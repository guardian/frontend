package rugby.jobs

import common.{AkkaAgent, ExecutionContexts, Logging}
import org.joda.time.format.{DateTimeFormat, DateTimeFormatter}
import rugby.feed.{OptaFeed, RugbyOptaFeedException}
import rugby.model.{ScoreEvent, Match}
import scala.concurrent.Future
import scala.util.Failure
import scala.util.Success

object RugbyStatsJob extends RugbyStatsJob

trait RugbyStatsJob extends ExecutionContexts with Logging {
  protected val liveScoreMatches = AkkaAgent[Map[String, Match]](Map.empty)
  protected val fixturesAndResultsMatches = AkkaAgent[Map[String, Match]](Map.empty)
  protected val scoreEvents = AkkaAgent[Map[String, Seq[ScoreEvent]]](Map.empty)
  val dateFormat: DateTimeFormatter = DateTimeFormat.forPattern("yyyy/MM/dd")

  def run() {
    sendLiveScores(OptaFeed.getLiveScores)
    fixturesAndResults(OptaFeed.getFixturesAndResults)
    fetchScoreEvents
  }

  def sendLiveScores(scoreData: Future[Seq[Match]]) : Future[Any] = {
    scoreData.flatMap { matches =>
      Future.sequence(matches.map { aMatch =>
        val key = createKey(aMatch)
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
        val key = createKey(aMatch)
        fixturesAndResultsMatches.alter {_ +  (key -> aMatch)}
      })
    }.recover {
      case optaFeedException: RugbyOptaFeedException => log.warn(s"RugbyStatsJob encountered errors: ${optaFeedException.message}")
      case error: Exception => log.warn(error.getMessage)
    }
  }

  //todo split in to fetchScoreEventsResults (updates 30 mins?) and live scores (every min)?
  def fetchScoreEvents {
    val liveMatches = liveScoreMatches.get().values
    val pastMatches = fixturesAndResultsMatches.get().values.filter(_.date.isBeforeNow)
    val matches = (liveMatches ++ pastMatches).map(_.id)

    val scoresEventsForMatchesFuture: Future[List[(String, List[ScoreEvent])]] = Future.sequence {
      matches.toList.map(matchId =>
        OptaFeed.getScoreEvents(matchId).map(scoreEvents => matchId -> scoreEvents.toList)
      )
    }
    scoresEventsForMatchesFuture.onComplete {
      case Success(result) => //do nothing
      case Failure(t) => log.warn("Failed to fetch live event score result with error:" + t)
    }

    val scoreEventsForMatchesAsMapFuture: Future[Map[String, List[ScoreEvent]]] = scoresEventsForMatchesFuture.map(_.toMap)

    scoreEventsForMatchesAsMapFuture.map { scoreEventsForMatchesMap =>
      scoreEventsForMatchesMap.map { case (aMatch, events) =>
        scoreEvents.alter { _ + (aMatch -> events)}
      }
    }
  }

  private def createKey(aMatch: Match): String = {
    val date = dateFormat.print(aMatch.date)
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

  def getScoreEvents(matchId: String): Seq[ScoreEvent] = scoreEvents.get().get(matchId).getOrElse(Seq.empty)

  private def isValidMatch(year: String, month: String, day: String, team1: String, team2: String, rugbyMatch: Match): Boolean = {
    rugbyMatch.hasTeam(team1) && rugbyMatch.hasTeam(team2) && dateFormat.print(rugbyMatch.date) == s"$year/$month/$day"
  }
}
