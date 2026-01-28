package feed

import com.github.nscala_time.time.Imports
import com.github.nscala_time.time.Imports._
import common._
import conf.FootballClient
import football.controllers.Interval
import model.{Competition, Table, TeamFixture, TeamNameBuilder}
import org.joda.time.DateTimeComparator
import pa.{FootballMatch, _}

import java.time.{Clock, LocalDate, ZonedDateTime}
import java.util.Comparator
import scala.collection.{View, immutable}
import scala.concurrent.{ExecutionContext, Future}
import scala.math.Ordering.Implicits._

trait Competitions extends implicits.Football {

  implicit val localDateOrdering: Ordering[LocalDate] = Ordering.by(_.toEpochDay)

  def competitions: Seq[Competition]

  def competitionsWithCompetitionFilter(path: String): Competitions =
    Competitions(
      competitions.filter(_.url == path),
    )

  def competitionsWithTag(tag: String): Option[Competition] = competitions.find(_.url.endsWith(s"/$tag"))

  def competitionsWithId(compId: String): Option[Competition] = competitions.find(_.id == compId)

  lazy val competitionsWithTodaysMatchesAndFutureFixtures = Competitions(
    competitions
      .map(c => c.copy(matches = c.matches.filter(m => m.isFixture || m.isOn(LocalDate.now()))))
      .filter(_.hasMatches),
  )

  lazy val competitionsWithTodaysMatchesAndPastResults = Competitions(
    competitions
      .map(c => c.copy(matches = c.matches.filter(m => m.isResult || m.isOn(LocalDate.now()))))
      .filter(_.hasMatches),
  )

  lazy val withTodaysMatches = Competitions(
    competitions.map(c => c.copy(matches = c.matches.filter(_.isOn(LocalDate.now())))).filter(_.hasMatches),
  )

  def withTeam(team: String): Competitions =
    Competitions(
      competitions.filter(_.hasLeagueTable).filter(_.leagueTable.exists(_.team.id == team)),
    )

  def mostPertinentCompetitionForTeam(teamId: String): Option[Competition] =
    withTeam(teamId).competitions
      .sortBy({ competition =>
        val table = Table(competition)
        val group = table.groups.find(_.entries.exists(_.team.id == teamId))
        -(group.map(_.entries.length) getOrElse competition.leagueTable.length)
      })
      .headOption

  lazy val matchDates = competitions.flatMap(_.matchDates).distinct.sorted

  def nextMatchDates(startDate: LocalDate, numDays: Int): Seq[LocalDate] =
    matchDates.filter(_ >= startDate).take(numDays)

  def previousMatchDates(date: LocalDate, numDays: Int): Seq[LocalDate] =
    matchDates.reverse.filter(_ <= date).take(numDays)

  def findMatch(id: String): Option[FootballMatch] = matches.find(_.id == id)
  def findCompetitionMatch(id: String): Option[(String, FootballMatch)] =
    matchesWithCompetition.find { case (_, m) => m.id == id }

  def competitionForMatch(matchId: String): Option[Competition] =
    competitions.find(_.matches.exists(_.id == matchId))

  def withTeamMatches(teamId: String): Seq[TeamFixture] =
    competitions
      .filter(_.hasMatches)
      .flatMap(c =>
        c.matches.filter(m => m.homeTeam.id == teamId || m.awayTeam.id == teamId).sortByDate.map { m =>
          TeamFixture(c, m)
        },
      )

  def findTeam(teamId: String): Option[FootballTeam] =
    competitions.flatMap(_.teams).find(_.id == teamId).map { unclean =>
      MatchDayTeam(teamId, unclean.name, None, None, None, None)
    }

  def matchFor(date: LocalDate, homeTeamId: String, awayTeamId: String): Option[FootballMatch] =
    matches.find(m => m.homeTeam.id == homeTeamId && m.awayTeam.id == awayTeamId && m.date.toLocalDate == date)

  // note team1 & team2 are the home and away team, but we do NOT know their order
  def matchFor(interval: Interval, team1: String, team2: String): Option[FootballMatch] = {
    matches
      .filter(m => interval.contains(m.date))
      .find(m => m.hasTeam(team1) && m.hasTeam(team2))
  }

  // note team1 & team2 are the home and away team, but we do NOT know their order
  def competitionMatchFor(interval: Interval, team1: String, team2: String): Option[(String, FootballMatch)] =
    matchesWithCompetition
      .find { case (_, m) =>
        interval.contains(m.date) && m.hasTeam(team1) && m.hasTeam(team2)
      }

  def sortedMatches: Seq[FootballMatch] = matches.sortByDate

  def matches: Seq[FootballMatch] = competitions.flatMap(_.matches)

  // Returns a lazy view of all matches paired with their competition ID.
  // WARNING: Only use this for single-pass lookups.
  def matchesWithCompetition: View[(String, FootballMatch)] =
    competitions.view.flatMap(comp => comp.matches.map(m => (comp.id, m)))

  def isMatchLiveOrAboutToStart(matches: Seq[FootballMatch], clock: Clock): Boolean =
    matches.exists(game => {
      val currentTime = ZonedDateTime.now(clock)
      game.isLive ||
      (game.date.minusMinutes(5).isBefore(currentTime) && game.date.plusMinutes(15).isAfter(currentTime))
    })
}

object Competitions {
  def apply(comps: Seq[Competition]): Competitions =
    new Competitions {
      val competitions = comps
    }
}

// when updating this code, think about whether the mobile apps api needs to be updated too
// https://github.com/guardian/mobile-apps-api
// common-pa-feeds/src/main/scala/com/gu/mobile/football/data/pa/PaCompetitions.scala

// Ordering is important! Competitions at the top of this list will be shown before competitions on the bottom
// on pages such as /football/fixtures
object CompetitionsProvider {
  val allCompetitions: Seq[Competition] = Seq(
    Competition(
      "700",
      "/football/world-cup-2026",
      "World Cup 2026",
      "World Cup 2026",
      "Internationals",
      showInTeamsList = true,
      tableDividers = List(2),
      startDate = Some(LocalDate.of(2025, 12, 2)),
    ),
    Competition(
      "100",
      "/football/premierleague",
      "Premier League",
      "Premier League",
      "English",
      showInTeamsList = true,
      tableDividers = List(4, 5, 17),
    ),
    Competition(
      "625",
      "/football/bundesligafootball",
      "Bundesliga",
      "Bundesliga",
      "European",
      showInTeamsList = true,
      tableDividers = List(3, 4, 6, 15, 16),
    ),
    Competition(
      "635",
      "/football/serieafootball",
      "Serie A",
      "Serie A",
      "European",
      showInTeamsList = true,
      tableDividers = List(4, 6, 17),
    ),
    Competition(
      "650",
      "/football/laligafootball",
      "La Liga",
      "La Liga",
      "European",
      showInTeamsList = true,
      tableDividers = List(4, 6, 17),
    ),
    Competition(
      "620",
      "/football/ligue1football",
      "Ligue 1",
      "Ligue 1",
      "European",
      showInTeamsList = true,
      tableDividers = List(3, 4, 16),
    ),
    Competition("961", "/football/womens-super-league", "Women's Super League", "Women's Super League", "English"),
    Competition(
      "500",
      "/football/championsleague",
      "Champions League",
      "Champions League",
      "European",
      tableDividers = List(8, 24),
    ),
    Competition(
      "701",
      "/football/world-cup-2026-qualifiers",
      "World Cup 2026 qualifying",
      "World Cup 2026 qual.",
      "Internationals",
    ),
    Competition(
      "510",
      "/football/uefa-europa-league",
      "Europa League",
      "Europa League",
      "European",
      showInTeamsList = true,
      tableDividers = List(8, 24),
    ),
    Competition("301", "/football/carabao-cup", "Carabao Cup", "Carabao Cup", "English"),
    Competition("721", "/football/friendlies", "International friendlies", "Friendlies", "Internationals"),
    Competition("300", "/football/fa-cup", "FA Cup", "FA Cup", "English"),
    Competition(
      "101",
      "/football/championship",
      "Championship",
      "Championship",
      "English",
      showInTeamsList = true,
      tableDividers = List(2, 6, 21),
    ),
    Competition(
      "120",
      "/football/scottish-premiership",
      "Scottish Premiership",
      "Scottish Premiership",
      "Scottish",
      showInTeamsList = true,
      tableDividers = List(1, 3, 6, 11),
    ),
    Competition(
      "102",
      "/football/leagueonefootball",
      "League One",
      "League One",
      "English",
      showInTeamsList = true,
      tableDividers = List(2, 6, 20),
    ),
    Competition(
      "103",
      "/football/leaguetwofootball",
      "League Two",
      "League Two",
      "English",
      showInTeamsList = true,
      tableDividers = List(3, 7, 22),
    ),
    Competition(
      "121",
      "/football/scottish-championship",
      "Scottish Championship",
      "Scottish Championship",
      "Scottish",
      showInTeamsList = true,
      tableDividers = List(1, 8, 9),
    ),
    Competition(
      "122",
      "/football/scottish-league-one",
      "Scottish League One",
      "Scottish League One",
      "Scottish",
      showInTeamsList = true,
      tableDividers = List(1, 4, 8, 9),
    ),
    Competition(
      "123",
      "/football/scottish-league-two",
      "Scottish League Two",
      "Scottish League Two",
      "Scottish",
      showInTeamsList = true,
      tableDividers = List(1, 4),
    ),
    Competition(
      "501",
      "/football/champions-league-qualifying",
      "Champions League qualifying",
      "Champions League qual.",
      "European",
    ),
    Competition(
      "400",
      "/football/community-shield",
      "Community Shield",
      "Community Shield",
      "English",
      showInTeamsList = true,
    ),
    Competition("320", "/football/scottishcup", "Scottish Cup", "Scottish Cup", "Scottish"),
    Competition("321", "/football/cis-insurance-cup", "Scottish League Cup", "Scottish League Cup", "Scottish"),
    Competition(
      "994",
      "/football/nations-league",
      "Nations League",
      "Nations League",
      "Internationals",
      showInTeamsList = true,
    ),
    Competition(
      "995",
      "/football/women-s-nations-league",
      "Women's Nations League",
      "Women's Nations League",
      "Internationals",
      showInTeamsList = true,
      tableDividers = List(2),
    ),
    Competition(
      "713",
      "/football/africannationscup",
      "Africa Cup of Nations",
      "Africa Cup of Nations",
      "Internationals",
      showInTeamsList = true,
      tableDividers = Seq(2, 3),
    ),
    Competition(
      "714",
      "/football/copa-america",
      "Copa America",
      "Copa America",
      "Internationals",
      showInTeamsList = true,
      tableDividers = Seq(2, 3),
    ),
    Competition(
      "970",
      "/football/women-s-champions-league",
      "Women's Champions League",
      "Women's Champions League",
      "European",
    ),
    Competition("333", "/football/womens-fa-cup", "Women's FA Cup", "Women's FA Cup", "English"),
    Competition(
      "516",
      "/football/europa-conference-league",
      "Europa Conference League",
      "Europa Conference League",
      "European",
      showInTeamsList = true,
      tableDividers = List(2),
    ),
  )
}

class CompetitionsService(val footballClient: FootballClient, competitionDefinitions: Seq[Competition])
    extends Competitions
    with LiveMatches
    with Lineups
    with GuLogging
    with implicits.Football {

  private implicit val dateOrdering: Ordering[Imports.DateTime] = Ordering.comparatorToOrdering(
    DateTimeComparator.getInstance.asInstanceOf[Comparator[DateTime]],
  )

  // Avoid fetching very old results from PA by restricting to most recent season
  private def oldestRelevantCompetitionSeasons(competitions: List[Season]): List[Season] =
    competitionDefinitions.flatMap { compDef =>
      competitions
        .filter(_.competitionId == compDef.id)
        .sortBy(_.startDate.atStartOfDay().toLocalDate)
        .reverse
        .headOption // get most recent season only
    }

  override val teamNameBuilder = new TeamNameBuilder(this)

  val competitionAgents = competitionDefinitions map { new CompetitionAgent(footballClient, teamNameBuilder, _) }
  val competitionIds: Seq[String] = competitionDefinitions map { _.id }

  override def competitions: Seq[Competition] = competitionAgents.map(_.competition)

  def refreshCompetitionAgent(id: String, clock: Clock)(implicit executionContext: ExecutionContext): Unit =
    competitionAgents
      .find { _.competition.id == id }
      .foreach { c =>
        c.refresh(clock)
        log.debug(
          s"Completed refresh of competition '${c.competition.fullName}': currently ${c.competition.matches.length} matches",
        )
      }

  def refreshCompetitionData()(implicit executionContext: ExecutionContext): Future[Unit] = {
    log.debug("Refreshing competition data")
    footballClient.competitions
      .map { allComps =>
        oldestRelevantCompetitionSeasons(allComps).foreach { season =>
          competitionAgents.find(_.competition.id == season.id).foreach { agent =>
            agent.competition.startDate match {
              case Some(existingStartDate) if season.startDate.isAfter(existingStartDate.atStartOfDay().toLocalDate) =>
                log.debug(
                  s"updating competition: ${season.id} season: ${season.seasonId} startDate was: ${existingStartDate.toString} now: ${season.startDate.toString}",
                )
                agent.update(agent.competition.copy(startDate = Some(season.startDate)))
              case None =>
                log.debug(
                  s"setting competition: ${season.id} season: ${season.seasonId} startDate was: None now: ${season.startDate.toString}",
                )
                agent.update(agent.competition.copy(startDate = Some(season.startDate)))
              case _ =>
            }
          }
        }
      }
      .recover(footballClient.logErrorsWithMessage("Failed refreshing competitions data"))
  }

  def refreshMatchDay(
      clock: Clock,
  )(implicit executionContext: ExecutionContext): Future[immutable.Iterable[Competition]] = {
    log.debug("Refreshing match day data")
    val result = getLiveMatches(clock).map(_.map { case (compId, newMatches) =>
      competitionAgents.find(_.competition.id == compId).map { agent =>
        agent.addMatches(newMatches)
      }
    })
    result.map(_.flatten).flatMap(Future.sequence(_))
  }

  def maybeRefreshLiveMatches(
      clock: Clock,
  )(implicit executionContext: ExecutionContext): Future[immutable.Iterable[Competition]] = {
    // matches is the list of all matches from all competitions
    if (isMatchLiveOrAboutToStart(matches, clock)) {
      log.debug("Match is in Progress - refreshing match day data")
      refreshMatchDay(clock)
    } else {
      Future.successful(immutable.Iterable[Competition]())
    }
  }
}
