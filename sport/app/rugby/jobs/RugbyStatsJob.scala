package rugby.jobs

import common.{AkkaAgent, ExecutionContexts, Logging}
import org.joda.time.format.{DateTimeFormat, DateTimeFormatter}
import rugby.feed.{OptaFeed, RugbyOptaFeedException}
import rugby.model.{ScoreEvent, Match}
import rugby.feed.{MatchNavigation, OptaFeed, RugbyOptaFeedException}
import rugby.model.{Status, Match, MatchStat}
import scala.concurrent.Future
import scala.util.Failure
import scala.util.Success

object RugbyStatsJob extends RugbyStatsJob

trait RugbyStatsJob extends ExecutionContexts with Logging {
  protected val liveScoreMatches = AkkaAgent[Map[String, Match]](Map.empty)
  protected val fixturesAndResultsMatches = AkkaAgent[Map[String, Match]](Map.empty)
  protected val matchNavContent = AkkaAgent[Map[String, MatchNavigation]](Map.empty)
  protected val liveScoreEvents = AkkaAgent[Map[String, Seq[ScoreEvent]]](Map.empty)
  protected val pastScoreEvents = AkkaAgent[Map[String, Seq[ScoreEvent]]](Map.empty)
  protected val liveMatchesStat = AkkaAgent[Map[String, MatchStat]](Map.empty)
  protected val pastMatchesStat = AkkaAgent[Map[String, MatchStat]](Map.empty)


  val dateFormat: DateTimeFormatter = DateTimeFormat.forPattern("yyyy/MM/dd")

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

  def fetchLiveScoreEvents {
    val liveMatches = liveScoreMatches.get().values.map(_.id).toList

    fetchScoreEvents(liveMatches).map { scoreEventsForMatchesMap =>
      scoreEventsForMatchesMap.foreach { case (aMatch, events) =>
        liveScoreEvents.alter { _ + (aMatch -> events)}
      }
    }
  }

  def fetchPastScoreEvents {
    val pastMatches = fixturesAndResultsMatches.get().values.filter(_.date.isBeforeNow).map(_.id).toList

    fetchScoreEvents(pastMatches).map { scoreEventsForMatchesMap =>
      scoreEventsForMatchesMap.foreach { case (aMatch, events) =>
        pastScoreEvents.alter { _ + (aMatch -> events)}
      }
    }
  }

  def fetchScoreEvents(matches: List[String]): Future[Map[String, List[ScoreEvent]]] = {
    val scoresEventsForMatchesFuture: Future[List[(String, List[ScoreEvent])]] = Future.sequence {
      matches.map(matchId =>
        OptaFeed.getScoreEvents(matchId).map(scoreEvents => matchId -> scoreEvents.toList)
      )
    }
    scoresEventsForMatchesFuture.onComplete {
      case Success(result) => //do nothing
      case Failure(t) => log.warn(s"Failed to fetch event score result with error: ${t.getMessage}" , t)
    }

    scoresEventsForMatchesFuture.map(_.toMap)
  }


  def fetchLiveMatchesStat {
    val liveMatches = liveScoreMatches.get().values.map(_.id).toList

    fetchMatchesStat(liveMatches).map { statForMatches =>
      statForMatches.foreach { case (aMatch, stat) =>
        liveMatchesStat.alter { _ + (aMatch -> stat)}
      }
    }
  }

  def fetchPastMatchesStat {
    val pastMatches = fixturesAndResultsMatches.get().values.filter(_.date.isBeforeNow).map(_.id).toList

    fetchMatchesStat(pastMatches).map { statForMatches =>
      statForMatches.foreach { case (aMatch, stat) =>
        pastMatchesStat.alter { _ + (aMatch -> stat)}
      }
    }
  }

  def fetchMatchesStat(matches: List[String]): Future[Map[String, MatchStat]] = {
    val statForMatchesFuture = Future.sequence {
      matches.map(matchId =>
        OptaFeed.getMatchStat(matchId).map(matchStat => matchId -> matchStat)
      )
    }
    statForMatchesFuture.onComplete {
      case Success(result) => //do nothing
      case Failure(t) => log.warn(s"Failed to fetch match stat with error: ${t.getMessage}", t)
    }

    statForMatchesFuture.map(_.toMap)
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

  def getScoreEvents(matchId: String): Seq[ScoreEvent] = {
    val liveScoreEvent = liveScoreEvents.get().get(matchId)
    liveScoreEvent.orElse(pastScoreEvents.get().get(matchId)).getOrElse(Seq.empty)
  }

  def getMatchStat(matchId: String): Option[MatchStat] = {
    val liveMatchStat = liveMatchesStat.get().get(matchId)
    liveMatchStat.orElse(pastMatchesStat.get().get(matchId))
  }

  def getMatchNavContent(rugbyMatch: Match): Option[MatchNavigation] = {
    matchNavContent.get.get(rugbyMatch.key)
  }

  private def isValidMatch(year: String, month: String, day: String, team1: String, team2: String, rugbyMatch: Match): Boolean = {
    rugbyMatch.hasTeam(team1) && rugbyMatch.hasTeam(team2) && Match.dateFormat.print(rugbyMatch.date) == s"$year/$month/$day"
  }
}
