package rugby.jobs

import com.gu.Box
import common.Logging
import org.joda.time.format.{DateTimeFormat, DateTimeFormatter}
import rugby.model._
import rugby.feed.{MatchNavigation, OptaEvent, OptaFeed, RugbyOptaFeedException}

import scala.collection.immutable
import scala.concurrent.{ExecutionContext, Future}
import scala.util.Failure
import scala.util.Success


class RugbyStatsJob(optaFeed: OptaFeed) extends Logging {
  protected val fixturesAndResultsMatches = Box[Map[String, Match]](Map.empty)
  protected val matchNavContent = Box[Map[String, MatchNavigation]](Map.empty)
  protected val pastScoreEvents = Box[Map[String, Seq[ScoreEvent]]](Map.empty)
  protected val pastMatchesStat = Box[Map[String, MatchStat]](Map.empty)
  protected val groupTables =  Box[Map[OptaEvent, Seq[GroupTable]]](Map.empty)

  val dateFormat: DateTimeFormatter = DateTimeFormat.forPattern("yyyy/MM/dd")

  def fetchFixturesAndResults()(implicit executionContext: ExecutionContext): Future[Any] = {
    optaFeed.getFixturesAndResults().flatMap { matches =>
      Future.sequence(matches.map { aMatch =>
        fixturesAndResultsMatches.alter {_ +  (aMatch.key -> aMatch)}
      })
    }.recover {
      case optaFeedException: RugbyOptaFeedException => log.warn(s"RugbyStatsJob encountered errors: ${optaFeedException.message}")
      case error: Exception => log.warn(error.getMessage, error)
    }
  }

  def fetchGroupTables()(implicit executionContext: ExecutionContext): Future[Any] = {
    optaFeed.getGroupTables().map { data =>
      groupTables.alter { data }
    }.recover {
      case optaFeedException: RugbyOptaFeedException => log.warn(s"RugbyStatsJob encountered errors: ${optaFeedException.message}")
      case error: Exception => log.warn(error.getMessage, error)
    }
  }

  def fetchPastScoreEvents()(implicit executionContext: ExecutionContext): Unit = {
    val pastMatches = fixturesAndResultsMatches.get().values.filter(_.date.isBeforeNow).toList

    fetchScoreEvents(pastMatches).map { scoreEventsForMatchesMap =>
      scoreEventsForMatchesMap.foreach { case (aMatch, events) =>
        pastScoreEvents.alter { _ + (aMatch.key -> events)}
      }
    }
  }

  private def fetchScoreEvents(matches: List[Match])(implicit executionContext: ExecutionContext): Future[Map[Match, List[ScoreEvent]]] = {
    val scoresEventsForMatchesFuture: Future[List[(Match, List[ScoreEvent])]] = Future.sequence {
      matches.map(rugbyMatch =>
        optaFeed.getScoreEvents(rugbyMatch).map(scoreEvents => rugbyMatch -> scoreEvents.toList)
      )
    }
    scoresEventsForMatchesFuture.onComplete {
      case Success(result) => //do nothing
      case Failure(t) => log.warn(s"Failed to fetch event score result with error: ${t.getMessage}" , t)
    }

    scoresEventsForMatchesFuture.map(_.toMap)
  }

  def fetchPastMatchesStat()(implicit executionContext: ExecutionContext): Unit = {
    val pastMatches = fixturesAndResultsMatches.get().values.filter(_.date.isBeforeNow).toList

    fetchMatchesStat(pastMatches).map { statForMatches =>
      statForMatches.foreach { case (aMatch, stat) =>
        pastMatchesStat.alter { _ + (aMatch.key -> stat)}
      }
    }
  }

  private def fetchMatchesStat(matches: List[Match])(implicit executionContext: ExecutionContext): Future[Map[Match, MatchStat]] = {
    val statForMatchesFuture = Future.sequence {
      matches.map(rugbyMatch =>
        optaFeed.getMatchStat(rugbyMatch).map(matchStat => rugbyMatch -> matchStat)
      )
    }
    statForMatchesFuture.onComplete {
      case Success(result) => //do nothing
      case Failure(t) => log.warn(s"Failed to fetch match stat with error: ${t.getMessage}", t)
    }

    statForMatchesFuture.map(_.toMap)
  }

  def sendMatchArticles(navigationArticles: Future[Map[String, MatchNavigation]])(implicit executionContext: ExecutionContext): Future[immutable.Iterable[Map[String, MatchNavigation]]] = {
    navigationArticles.flatMap { matches =>
      Future.sequence(matches.map { matchItem =>
        matchNavContent.alter { _ + matchItem }
      })
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

  def getAllResults(): Seq[Match] = fixturesAndResultsMatches.get.values.toList.filter(_.status == Status.Result)

  def getScoreEvents(rugbyMatch: Match): Seq[ScoreEvent] = pastScoreEvents.get().getOrElse(rugbyMatch.key, Seq.empty)

  def getMatchStat(rugbyMatch: Match): Option[MatchStat] = pastMatchesStat.get().get(rugbyMatch.key)

  def getMatchNavContent(rugbyMatch: Match): Option[MatchNavigation] = {
    matchNavContent.get.get(rugbyMatch.key)
  }

  private def isValidMatch(year: String, month: String, day: String, team1: String, team2: String, rugbyMatch: Match): Boolean = {
    rugbyMatch.hasTeam(team1) && rugbyMatch.hasTeam(team2) && Match.dateFormat.print(rugbyMatch.date) == s"$year/$month/$day"
  }
}
