package jobs

import common.{Box, GuLogging}
import conf.cricketPa.{CompetitionMatch, CricketFeedException, CricketTeam, CricketTeams, PaFeed}
import cricketModel.Match
import jobs.CricketStatsJob._

import java.time.{LocalDate, LocalDateTime}
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

  /** Refresh the fixtures/results registry for every team. This only updates the lightweight list of known matches.
    */
  def discoverMatches(fromDate: LocalDateTime, toDate: LocalDateTime)(implicit
      executionContext: ExecutionContext,
  ): Future[Unit] = {
    Future
      .traverse(CricketTeams.teams) { team =>
        paFeed
          .getCompetitionMatches(team, fromDate.toLocalDate)
          .map { competitionMatches: Seq[CompetitionMatch] =>
            val discovered = competitionMatches.filterNot(_.startDate.isAfter(toDate))
            log.info(s"Discovered ${discovered.size} matches for ${team.paId} between $fromDate and $toDate")
            discoveredCricketTeamMatches(team).send(discovered.map(cm => cm.matchId -> cm).toMap)

            fetchNewMatchData() // fetch the full match data for any newly discovered matches
          }
          .recover {
            case paFeedError: CricketFeedException =>
              log.warn(s"CricketStatsJob discovery couldn't find matches: ${paFeedError.message}")
            case error: Exception => log.warn(error.getMessage)
          }
      }
      .map(_ => ())
  }

  def fetchNewMatchData()(implicit executionContext: ExecutionContext): Unit = {
    val newMatches = CricketTeams.teams.flatMap { team =>
      discoveredCricketTeamMatches(team)
        .apply()
        .values
        .filterNot(cm => cricketMatchData(team).apply().values.exists(_.matchId == cm.matchId))
        .map(cm => (team, cm))
    }

    batchUpdateMatchData(newMatches)
  }

  def refreshActiveMatchData()(implicit executionContext: ExecutionContext): Unit = {
    refreshMatchData(MatchType.Active)
  }

  def refreshUpcomingMatchData()(implicit executionContext: ExecutionContext): Unit = {
    refreshMatchData(MatchType.Upcoming)
  }

  private def refreshMatchData(band: MatchType)(implicit executionContext: ExecutionContext): Unit = {
    val matches = CricketTeams.teams.flatMap { team =>
      discoveredCricketTeamMatches(team)
        .apply()
        .values
        .filter(cm => classify(cm.startDate, cm.endDate) == band)
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

    case object Upcoming extends MatchType

    case object Active extends MatchType

    case object Historical extends MatchType
  }

  // A match is considered "upcoming" when it starts within this many days.
  private val upcomingDays = 5L

  /** Classify a match by the proximity of its start date to `today`. */
  def classify(startDate: LocalDateTime, endDate: LocalDateTime): MatchType = {
    val today = LocalDate.now
    (startDate.toLocalDate(), endDate.toLocalDate()) match {
      case (start, _) if start.isAfter(today) && start.isBefore(today.plusDays(upcomingDays)) =>
        MatchType.Upcoming
      case (start, end) if (start.isEqual(today) || start.isBefore(today)) && end.isAfter(today) => MatchType.Active
      case _                                                                                     => MatchType.Historical
    }
  }
}
