package jobs

import common.{Box, GuLogging}
import conf.cricketPa.{CompetitionMatch, CricketFeedException, CricketTeam, CricketTeams, PaFeed}
import cricketModel.Match
import jobs.CricketStatsJob._

import java.time.{LocalDate, ZonedDateTime}
import scala.concurrent.ExecutionContext
import scala.concurrent.Future

class CricketStatsJob(paFeed: PaFeed) extends GuLogging {

  private val batchRequestSize = 10

  // The full match data cache with scorecard, line-ups, and match details.
  private val cricketMatchData: Map[CricketTeam, Box[Map[String, Match]]] =
    CricketTeams.teams.map(team => team -> Box[Map[String, Match]](Map.empty)).toMap

  // Overview of the matches for each team, with only the match ID and start date.
  private val discoveredCricketTeamMatches: Map[CricketTeam, Box[Map[String, CompetitionMatch]]] =
    CricketTeams.teams.map(team => team -> Box[Map[String, CompetitionMatch]](Map.empty)).toMap

  def getMatch(team: CricketTeam, date: String): Option[Match] =
    cricketMatchData.get(team).flatMap(_.apply().get(date))

  def findMatch(team: CricketTeam, date: String): Option[Match] = {
    val dateFormat = PaFeed.dateFormat
    val requestDate: LocalDate = LocalDate.parse(date, dateFormat)

    val matchObjects = for {
      day <- 0 until 6 // normally test matches are 5 days but we have seen at least 6 days in practice
      date <- Some(dateFormat.format(requestDate.minusDays(day)))
    } yield {
      getMatch(team, date)
    }
    matchObjects.flatten.headOption
  }

  /** Refresh the fixtures/results registry for every team and fetch the full match data for any newly discovered
    * matches.
    */
  def discoverMatches(fromDate: LocalDate, toDate: LocalDate)(implicit
      executionContext: ExecutionContext,
  ): Future[Unit] = {
    Future
      .traverse(CricketTeams.teams) { team =>
        paFeed
          .getCompetitionMatches(team, fromDate)
          .map { competitionMatches: Seq[CompetitionMatch] =>
            discoveredCricketTeamMatches(team).send(competitionMatches.map(cm => cm.matchId -> cm).toMap)
          }
          .recover {
            case paFeedError: CricketFeedException =>
              log.warn(s"CricketStatsJob discovery couldn't find matches: ${paFeedError.message}")
            case error: Exception => log.warn(error.getMessage)
          }
      }
      .map { _ =>
        fetchNewMatchData()
      }
  }

  def fetchNewMatchData()(implicit executionContext: ExecutionContext): Future[Unit] = {
    val newMatches = CricketTeams.teams.flatMap { team =>
      discoveredCricketTeamMatches(team)
        .apply()
        .values
        .filterNot(cm => cricketMatchData(team).apply().values.exists(_.matchId == cm.matchId))
        .map(cm => (team, cm))
    }

    batchUpdateMatchData(newMatches)
  }

  def activeMatchDataRefresh()(implicit executionContext: ExecutionContext): Future[Unit] = {
    refreshMatchData(MatchType.Active)
  }

  def upcomingMatchDataRefresh()(implicit executionContext: ExecutionContext): Future[Unit] = {
    refreshMatchData(MatchType.Upcoming)
  }

  def infrequentMatchDataRefresh()(implicit executionContext: ExecutionContext): Future[Unit] = {
    Future.sequence(Seq(refreshMatchData(MatchType.Future), refreshMatchData(MatchType.Historical))).map(_ => ())
  }

  private def refreshMatchData(band: MatchType)(implicit executionContext: ExecutionContext): Future[Unit] = {
    val matches = CricketTeams.teams.flatMap { team =>
      discoveredCricketTeamMatches(team)
        .apply()
        .values
        .filter(cm => classify(cm.startDateTime) == band)
        .map(cm => (team, cm))
    }

    batchUpdateMatchData(matches)
  }

  private def batchUpdateMatchData(matches: Seq[(CricketTeam, CompetitionMatch)])(implicit
      executionContext: ExecutionContext,
  ): Future[Unit] = {
    matches.grouped(batchRequestSize).foldLeft(Future.successful(())) { (previousBatch, batch) =>
      previousBatch.flatMap { _ =>
        Future.traverse(batch) { case (team, cm) => updateMatchData(team, cm) }.map(_ => ())
      }
    }
  }

  private def updateMatchData(team: CricketTeam, competitionMatch: CompetitionMatch)(implicit
      executionContext: ExecutionContext,
  ): Future[Unit] = {
    paFeed
      .getMatch(competitionMatch)
      .map { matchData =>
        val date = PaFeed.dateFormat.format(matchData.gameDate)
        log.debug(s"Updating cricket match: ${matchData.homeTeam.name} v ${matchData.awayTeam.name}, $date")
        cricketMatchData(team).send(_ + (date -> matchData))
      }
      .recover {
        case paFeedError: CricketFeedException =>
          log.warn(s"CricketStatsJob encountered errors: ${paFeedError.message}")
        case error: Exception => log.warn(error.getMessage)
      }
  }
}

object CricketStatsJob {

  sealed trait MatchType
  object MatchType {

    case object Future extends MatchType

    case object Upcoming extends MatchType

    case object Active extends MatchType

    case object Historical extends MatchType
  }

  // A match is considered "upcoming" when it starts within this many days.
  private val upcomingDays = 5L

  private val activeBufferMinutes = 30

  def classify(startDateTime: ZonedDateTime): MatchType = {
    val endDateTime = startDateTime.plusDays(5) // cricket matches are typically max 5 days long but can be 6
    val today = ZonedDateTime.now

    if (
      !startDateTime
        .minusMinutes(activeBufferMinutes)
        .isAfter(today) && !endDateTime.isBefore(today)
    ) {
      // a match is considered "active" from 30 minutes before it starts until it has finished, refreshed every 5 minutes
      MatchType.Active
    } else if (startDateTime.isAfter(today) && startDateTime.isBefore(today.plusDays(upcomingDays))) {
      // a match is considered "upcoming" if it starts within the next 5 days, refreshed every hour
      MatchType.Upcoming
    } else if (endDateTime.isBefore(today)) {
      MatchType.Historical
    } else {
      MatchType.Future
    }
  }
}
