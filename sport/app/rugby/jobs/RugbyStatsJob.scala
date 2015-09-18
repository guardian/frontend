package rugby.jobs

import common.{AkkaAgent, ExecutionContexts, Logging}
import org.joda.time.format.{DateTimeFormat, DateTimeFormatter}
import rugby.feed.{OptaFeed, RugbyOptaFeedException}
import rugby.model._
import rugby.feed.{MatchNavigation, OptaFeed, OptaEvent, RugbyOptaFeedException}
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
  protected val groupTables =  AkkaAgent[Map[OptaEvent, Seq[GroupTable]]](Map.empty)


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
      case error: Exception => log.warn(error.getMessage, error)
    }
  }

  def fixturesAndResults(fixturesAndResults: Future[Seq[Match]]) : Future[Any] = {
    fixturesAndResults.flatMap { matches =>
      Future.sequence(matches.map { aMatch =>
        fixturesAndResultsMatches.alter {_ +  (aMatch.key -> aMatch)}
      })
    }.recover {
      case optaFeedException: RugbyOptaFeedException => log.warn(s"RugbyStatsJob encountered errors: ${optaFeedException.message}")
      case error: Exception => log.warn(error.getMessage, error)
    }
  }

  def groupTables(groupTablesData: Future[Map[OptaEvent, Seq[GroupTable]]]) : Future[Any] = {
    groupTablesData.map { data =>
      groupTables.alter { data }
    }.recover {
      case optaFeedException: RugbyOptaFeedException => log.warn(s"RugbyStatsJob encountered errors: ${optaFeedException.message}")
      case error: Exception => log.warn(error.getMessage, error)
    }
  }


  def fetchLiveScoreEvents {
    val liveMatches = liveScoreMatches.get().values.toList

    fetchScoreEvents(liveMatches).map { scoreEventsForMatchesMap =>
      scoreEventsForMatchesMap.foreach { case (aMatch, events) =>
        liveScoreEvents.alter { _ + (aMatch.key -> events)}
      }
    }
  }

  def fetchPastScoreEvents {
    val pastMatches = fixturesAndResultsMatches.get().values.filter(_.date.isBeforeNow).toList

    fetchScoreEvents(pastMatches).map { scoreEventsForMatchesMap =>
      scoreEventsForMatchesMap.foreach { case (aMatch, events) =>
        pastScoreEvents.alter { _ + (aMatch.key -> events)}
      }
    }
  }

  private def fetchScoreEvents(matches: List[Match]): Future[Map[Match, List[ScoreEvent]]] = {
    val scoresEventsForMatchesFuture: Future[List[(Match, List[ScoreEvent])]] = Future.sequence {
      matches.map(rugbyMatch =>
        OptaFeed.getScoreEvents(rugbyMatch).map(scoreEvents => rugbyMatch -> scoreEvents.toList)
      )
    }
    scoresEventsForMatchesFuture.onComplete {
      case Success(result) => //do nothing
      case Failure(t) => log.warn(s"Failed to fetch event score result with error: ${t.getMessage}" , t)
    }

    scoresEventsForMatchesFuture.map(_.toMap)
  }


  def fetchLiveMatchesStat {
    val liveMatches = liveScoreMatches.get().values.toList

    fetchMatchesStat(liveMatches).map { statForMatches =>
      statForMatches.foreach { case (aMatch, stat) =>
        liveMatchesStat.alter { _ + (aMatch.key -> stat)}
      }
    }
  }

  def fetchPastMatchesStat {
    val pastMatches = fixturesAndResultsMatches.get().values.filter(_.date.isBeforeNow).toList

    fetchMatchesStat(pastMatches).map { statForMatches =>
      statForMatches.foreach { case (aMatch, stat) =>
        pastMatchesStat.alter { _ + (aMatch.key -> stat)}
      }
    }
  }

  private def fetchMatchesStat(matches: List[Match]): Future[Map[Match, MatchStat]] = {
    val statForMatchesFuture = Future.sequence {
      matches.map(rugbyMatch =>
        OptaFeed.getMatchStat(rugbyMatch).map(matchStat => rugbyMatch -> matchStat)
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

  def getFixturesAndResultScore(year: String, month: String, day: String, homeTeamId: String, awayTeamId: String): Option[Match] = {
    fixturesAndResultsMatches.get.values.find { rugbyMatch =>
      isValidMatch(year, month, day, homeTeamId, awayTeamId, rugbyMatch)
    }
  }

  def getGroupTable(rugbyMatch: Match): Option[GroupTable] = {
    if (rugbyMatch.hasGroupTable) {
      groupTables.get.get(rugbyMatch.event).flatMap { tables =>
        tables.find { groupTable =>
          groupTable.teams.exists(_.id == rugbyMatch.homeTeam.id)
        }
      }
    } else {
      None
    }
  }

  def getAllResults(): Seq[Match] = {
    fixturesAndResultsMatches.get.values.toList.filter(_.status == Status.Result) ++
      liveScoreMatches.get.values.toList.filter(_.status == Status.Result)
  }

  def getScoreEvents(rugbyMatch: Match): Seq[ScoreEvent] = {
    val liveScoreEvent = liveScoreEvents.get().get(rugbyMatch.key)
    liveScoreEvent.orElse(pastScoreEvents.get().get(rugbyMatch.key)).getOrElse(Seq.empty)
  }

  def getMatchStat(rugbyMatch: Match): Option[MatchStat] = {
    val liveMatchStat = liveMatchesStat.get().get(rugbyMatch.key)
    liveMatchStat.orElse(pastMatchesStat.get().get(rugbyMatch.key))
  }

  def getMatchNavContent(rugbyMatch: Match): Option[MatchNavigation] = {
    matchNavContent.get.get(rugbyMatch.key)
  }

  private def isValidMatch(year: String, month: String, day: String, team1: String, team2: String, rugbyMatch: Match): Boolean = {
    rugbyMatch.hasTeam(team1) && rugbyMatch.hasTeam(team2) && Match.dateFormat.print(rugbyMatch.date) == s"$year/$month/$day"
  }
}
