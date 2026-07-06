package jobs

import common.{Box, GuLogging}
import conf.cricketPa.{CompetitionMatch, CricketFeedException, CricketTeam, CricketTeams, PaFeed}
import cricketModel.Match
import jobs.CricketStatsJob._

import java.time.{LocalDate, LocalDateTime}
import scala.concurrent.ExecutionContext

class CricketStatsJob(paFeed: PaFeed) extends GuLogging {

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
  ): Unit = {
    CricketTeams.teams.foreach { team =>
      paFeed
        .getCompetitionMatches(team, fromDate.toLocalDate)
        .map { competitionMatches: Seq[CompetitionMatch] =>
          val discovered = competitionMatches.filterNot(_.startDate.isAfter(toDate))
          discoveredCricketTeamMatches(team).send(discovered.map(cm => cm.matchId -> cm).toMap)
        }
        .recover {
          case paFeedError: CricketFeedException =>
            log.warn(s"CricketStatsJob discovery couldn't find matches: ${paFeedError.message}")
          case error: Exception => log.warn(error.getMessage)
        }
    }
  }

  /** Discovered matches (across all teams) whose full data has never been fetched. */
  private def unfetchedMatches: Seq[(CricketTeam, CompetitionMatch)] =
    CricketTeams.teams.flatMap { team =>
      val cachedIds = cricketMatchData(team).apply().values.map(_.matchId).toSet
      discoveredCricketTeamMatches(team)
        .apply()
        .values
        .filterNot(cm => cachedIds.contains(cm.matchId))
        .map(cm => (team, cm))
    }

  /** Backfill the full match data for discovered matches that have never been fetched. This is done in batches to avoid
    * overloading the cricket API.
    */
  def backfillMatches()(implicit executionContext: ExecutionContext): Unit = {
    val unfetched = unfetchedMatches
    if (unfetched.nonEmpty) {
      unfetched.take(matchesPerCycle).foreach { case (team, cm) => updateMatchData(team, cm) }
    }
  }

  def refreshActiveMatchData()(implicit executionContext: ExecutionContext): Unit = {
    val unfetched = unfetchedMatches
    if (unfetched.isEmpty) {
      refreshMatchData(MatchType.Active)
    }
  }

  def refreshUpcomingMatchData()(implicit executionContext: ExecutionContext): Unit = {
    if (unfetchedMatches.isEmpty) {
      refreshMatchData(MatchType.Upcoming)
    }
  }

  private def refreshMatchData(band: MatchType)(implicit executionContext: ExecutionContext): Unit = {
    CricketTeams.teams.foreach { team =>
      discoveredCricketTeamMatches(team)
        .apply()
        .values
        .filter(cm => classify(cm.startDate) == band)
        .foreach(cm => updateMatchData(team, cm))
    }
  }

  private def updateMatchData(team: CricketTeam, competitionMatch: CompetitionMatch)(implicit
      executionContext: ExecutionContext,
  ): Unit = {
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

  // The most matches to start loading in a single backfill cycle.
  val matchesPerCycle = 10

  // A match is considered "upcoming" when it starts within this many days.
  private val upcomingDays = 5L

  // A match stays "active" until this many days after its start, to cover
  // multi-day test matches (seen to run at least 6 days) while they settle.
  private val historicalAfterDays = 6L

  /** Classify a match by the proximity of its start date to `today`. */
  def classify(startDate: LocalDateTime): MatchType = {
    val today = LocalDateTime.now
    startDate match {
      case d if d.isAfter(today.plusDays(upcomingDays))              => MatchType.Upcoming
      case d if d.isBefore(today.minusDays(historicalAfterDays + 1)) =>
        MatchType.Historical // + 1 to include the start date itself in the active band
      case _ => MatchType.Active
    }
  }
}
