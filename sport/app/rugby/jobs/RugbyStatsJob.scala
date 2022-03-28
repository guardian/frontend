package rugby.jobs

import common.{Box, GuLogging}
import org.joda.time.format.{DateTimeFormat, DateTimeFormatter}
import rugby.feed.{Event, MatchNavigation, PARugbyAPIException, RugbyFeed}
import rugby.model._

import scala.collection.immutable
import scala.concurrent.{ExecutionContext, Future}

class RugbyStatsJob(feed: RugbyFeed) extends GuLogging {
  protected val fixturesAndResultsMatches = Box[Map[String, Match]](Map.empty)
  protected val matchNavContent = Box[Map[String, MatchNavigation]](Map.empty)
  protected val pastScoreEvents = Box[Map[String, Seq[ScoreEvent]]](Map.empty)
  protected val pastMatchesStat = Box[Map[String, MatchStat]](Map.empty)
  protected val groupTables = Box[Map[Event, Seq[GroupTable]]](Map.empty)

  val dateFormat: DateTimeFormatter = DateTimeFormat.forPattern("yyyy/MM/dd")

  def fetchFixturesAndResults()(implicit executionContext: ExecutionContext): Future[Any] = {
    feed
      .getFixturesAndResults()
      .flatMap { matches =>
        Future.sequence(matches.map { aMatch =>
          fixturesAndResultsMatches.alter { _ + (aMatch.key -> aMatch) }
        })
      }
      .recover {
        case paException: PARugbyAPIException => log.warn(s"RugbyStatsJob encountered errors: ${paException.msg}")
        case error: Exception                 => log.warn(error.getMessage, error)
      }
  }

  def sendMatchArticles(
      navigationArticles: Future[Map[String, MatchNavigation]],
  )(implicit executionContext: ExecutionContext): Future[immutable.Iterable[Map[String, MatchNavigation]]] = {
    navigationArticles.flatMap { matches =>
      Future.sequence(matches.map { matchItem =>
        matchNavContent.alter { _ + matchItem }
      })
    }
  }

  def getFixturesAndResultScore(
      year: String,
      month: String,
      day: String,
      homeTeamId: String,
      awayTeamId: String,
  ): Option[Match] = {
    fixturesAndResultsMatches.get.values.find { rugbyMatch =>
      isValidMatch(year, month, day, homeTeamId, awayTeamId, rugbyMatch)
    }
  }

  def getAllResults(): Seq[Match] = fixturesAndResultsMatches.get.values.toList.filter(_.status == Status.Result)

  def getMatchNavContent(rugbyMatch: Match): Option[MatchNavigation] = {
    matchNavContent.get.get(rugbyMatch.key)
  }

  private def isValidMatch(
      year: String,
      month: String,
      day: String,
      team1: String,
      team2: String,
      rugbyMatch: Match,
  ): Boolean = {
    rugbyMatch.hasTeam(team1) && rugbyMatch.hasTeam(team2) && Match.dateFormat.print(
      rugbyMatch.date,
    ) == s"$year/$month/$day"
  }
}
