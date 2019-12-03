package feed

import common._
import conf.FootballClient
import java.util.Comparator

import model.{Competition, Table, TeamFixture, TeamNameBuilder}
import org.joda.time.{DateTimeComparator, LocalDate}
import com.github.nscala_time.time.Imports._
import pa._

import scala.collection.immutable
import scala.concurrent.{ExecutionContext, Future}


trait Competitions extends implicits.Football {

  private implicit val localDateOrdering = Ordering.comparatorToOrdering(
    DateTimeComparator.getInstance.asInstanceOf[Comparator[LocalDate]]
  )

  def competitions: Seq[Competition]

  def competitionsWithCompetitionFilter(path: String): Competitions = Competitions(
    competitions.filter(_.url == path)
  )

  def competitionsWithTag(tag: String): Option[Competition] = competitions.find(_.url.endsWith(tag))

  def competitionsWithId(compId: String): Option[Competition] = competitions.find(_.id == compId)

  lazy val competitionsWithTodaysMatchesAndFutureFixtures = Competitions(
    competitions.map(c => c.copy(matches = c.matches.filter(m => m.isFixture || m.isOn(new LocalDate)))).filter(_.hasMatches)
  )

  lazy val competitionsWithTodaysMatchesAndPastResults = Competitions(
    competitions.map(c => c.copy(matches = c.matches.filter(m => m.isResult || m.isOn(new LocalDate)))).filter(_.hasMatches)
  )

  lazy val withTodaysMatches = Competitions(
    competitions.map(c => c.copy(matches = c.matches.filter(_.isOn(new LocalDate)))).filter(_.hasMatches)
  )

  def withTeam(team: String): Competitions = Competitions(
    competitions.filter(_.hasLeagueTable).filter(_.leagueTable.exists(_.team.id == team))
  )

  def mostPertinentCompetitionForTeam(teamId: String): Option[Competition] =
    withTeam(teamId).competitions.sortBy({ competition =>
      val table = Table(competition)
      val group = table.groups.find(_.entries.exists(_.team.id == teamId))
      -(group.map(_.entries.length) getOrElse competition.leagueTable.length)
    }).headOption

  lazy val matchDates = competitions.flatMap(_.matchDates).distinct.sorted(localDateOrdering)

  def nextMatchDates(startDate: LocalDate, numDays: Int): Seq[LocalDate] = matchDates.filter(_ >= startDate).take(numDays)

  def previousMatchDates(date: LocalDate, numDays: Int): Seq[LocalDate] = matchDates.reverse.filter(_ <= date).take(numDays)

  def findMatch(id: String): Option[FootballMatch] = matches.find(_.id == id)

  def competitionForMatch(matchId: String): Option[Competition] =
    competitions.find(_.matches.exists(_.id == matchId))

  def withTeamMatches(teamId: String): Seq[TeamFixture] = competitions.filter(_.hasMatches).flatMap(c =>
    c.matches.filter(m => m.homeTeam.id == teamId || m.awayTeam.id == teamId).sortByDate.map { m =>
      TeamFixture(c, m)
    }
  )

  def findTeam(teamId: String): Option[FootballTeam] = competitions.flatMap(_.teams).find(_.id == teamId).map { unclean =>
    MatchDayTeam(teamId, unclean.name, None, None, None, None)
  }

  def matchFor(date: LocalDate, homeTeamId: String, awayTeamId: String): Option[FootballMatch] =
    matches.find(m => m.homeTeam.id == homeTeamId && m.awayTeam.id == awayTeamId && m.date.toLocalDate == date)

  // note team1 & team2 are the home and away team, but we do NOT know their order
  def matchFor(interval: Interval, team1: String, team2: String): Option[FootballMatch] = matches
    .filter(m => interval.contains(m.date))
    .find(m => m.hasTeam(team1) && m.hasTeam(team2))

  def matches: Seq[FootballMatch] = competitions.flatMap(_.matches).sortByDate

}

object Competitions {
  def apply(comps: Seq[Competition]): Competitions = new Competitions {
    val competitions = comps
  }
}

// when updating this code, think about whether the mobile apps api needs to be updated too
// https://github.com/guardian/mobile-apps-api
// common-pa-feeds/src/main/scala/com/gu/mobile/football/data/pa/PaCompetitions.scala

object CompetitionsProvider {
  val allCompetitions: Seq[Competition] = Seq(

    Competition("100", "/football/premierleague", "Premier League", "Premier League", "English", showInTeamsList = true, tableDividers = List(4, 5, 17)),
    Competition("625", "/football/bundesligafootball", "Bundesliga", "Bundesliga", "European", showInTeamsList = true, tableDividers = List(3, 4, 6, 15, 16)),
    Competition("635", "/football/serieafootball", "Serie A", "Serie A", "European", showInTeamsList = true, tableDividers = List(4, 6, 17)),
    Competition("650", "/football/laligafootball", "La Liga", "La Liga", "European", showInTeamsList = true, tableDividers = List(4, 6, 17)),
    Competition("620", "/football/ligue1football", "Ligue 1", "Ligue 1", "European", showInTeamsList = true, tableDividers = List(3, 4, 17)),
    Competition("961", "/football/womens-super-league", "Women's Super League",  "Women's Super League", "English"),
    Competition("500", "/football/championsleague", "Champions League", "Champions League", "European", tableDividers = List(2, 6, 21)),
    Competition("751", "/football/euro-2020-qualifiers", "Euro 2020 qualifying", "Euro 2020 qual.", "Internationals"),
    Competition("510", "/football/uefa-europa-league", "Europa League", "Europa League", "European", tableDividers = List(2)),
    Competition("301", "/football/carabao-cup", "Carabao Cup", "Carabao Cup", "English"),
    Competition("721", "/football/friendlies", "International friendlies", "Friendlies", "Internationals"),
    Competition("300", "/football/fa-cup", "FA Cup", "FA Cup", "English"),
    Competition("101", "/football/championship", "Championship", "Championship", "English", showInTeamsList = true, tableDividers = List(2, 6, 21)),
    Competition("120", "/football/scottish-premiership", "Scottish Premiership", "Scottish Premiership", "Scottish", showInTeamsList = true, tableDividers = List(1, 3, 6, 11)),
    Competition("102", "/football/leagueonefootball", "League One", "League One", "English", showInTeamsList = true, tableDividers = List(2, 6, 20)),
    Competition("103", "/football/leaguetwofootball", "League Two", "League Two", "English", showInTeamsList = true, tableDividers = List(3, 7, 22)),
    Competition("121", "/football/scottish-championship", "Scottish Championship", "Scottish Championship", "Scottish", showInTeamsList = true, tableDividers = List(1, 8, 9)),
    Competition("122", "/football/scottish-league-one", "Scottish League One", "Scottish League One", "Scottish", showInTeamsList = true, tableDividers = List(1, 4, 8, 9)),
    Competition("123", "/football/scottish-league-two", "Scottish League Two", "Scottish League Two", "Scottish", showInTeamsList = true, tableDividers = List(1, 4)),
    Competition("501", "/football/champions-league-qualifying", "Champions League qualifying", "Champions League qual.", "European"),
    Competition("400", "/football/community-shield", "Community Shield", "Community Shield", "English", showInTeamsList = true),
    Competition("320", "/football/scottishcup", "Scottish Cup", "Scottish Cup", "Scottish"),
    Competition("321", "/football/cis-insurance-cup", "Scottish League Cup", "Scottish League Cup", "Scottish"),
    Competition("994", "/football/nations-league", "Nations League", "Nations League", "Internationals", showInTeamsList = true),
    Competition("713", "/football/africannationscup", "Africa Cup of Nations", "Africa Cup of Nations", "Internationals", showInTeamsList = true, tableDividers = Seq(2, 3)),
    Competition("714", "/football/copa-america", "Copa America", "Copa America", "Internationals", showInTeamsList = true, tableDividers = Seq(2, 3)),
    Competition("970", "/football/women-s-champions-league", "Women's Champions League", "Women's Champions League", "European"),
    Competition("333", "/football/womens-fa-cup", "Women's FA Cup", "Women's FA Cup", "English")

  )
}

class CompetitionsService(val footballClient: FootballClient, competitionDefinitions: Seq[Competition])
  extends Competitions
    with LiveMatches
    with Lineups
    with Logging
    with implicits.Collections
    with implicits.Football {

  private implicit val dateOrdering = Ordering.comparatorToOrdering(
    DateTimeComparator.getInstance.asInstanceOf[Comparator[DateTime]]
  )

  // Avoid fetching very old results from PA by restricting to most recent 2 seasons
  private def oldestRelevantCompetitionSeasons(competitions: List[Season]): List[Season] =
    competitionDefinitions.flatMap { compDef =>
      competitions
        .filter(_.competitionId == compDef.id)
        .sortBy(_.startDate.toDateTimeAtStartOfDay.getMillis).reverse
        .take(2)  // Take most recent 2 seasons
        .lastOption // Use the older of these for the start date
    }

  override val teamNameBuilder = new TeamNameBuilder(this)

  val competitionAgents = competitionDefinitions map { new CompetitionAgent(footballClient, teamNameBuilder, _) }
  val competitionIds: Seq[String] = competitionDefinitions map { _.id }

  override def competitions: Seq[Competition] = competitionAgents.map(_.competition)

  def refreshCompetitionAgent(id: String)(implicit executionContext: ExecutionContext): Unit = competitionAgents
    .find { _.competition.id == id }
    .foreach { c =>
      c.refresh()
      log.info(s"Completed refresh of competition '${c.competition.fullName}': currently ${c.competition.matches.length} matches")
    }

  def refreshCompetitionData()(implicit executionContext: ExecutionContext): Future[Unit] = {
    log.info("Refreshing competition data")
    footballClient.competitions.map { allComps =>
      oldestRelevantCompetitionSeasons(allComps).foreach { season =>
        competitionAgents.find(_.competition.id == season.id).foreach { agent =>
          agent.competition.startDate match {
            case Some(existingStartDate) if season.startDate.isAfter(existingStartDate.toDateTimeAtStartOfDay) =>
              log.info(s"updating competition: ${season.id} season: ${season.seasonId} startDate was: ${existingStartDate.toString} now: ${season.startDate.toString}")
              agent.update(agent.competition.copy(startDate = Some(season.startDate)))
            case None =>
              log.info(s"setting competition: ${season.id} season: ${season.seasonId} startDate was: None now: ${season.startDate.toString}")
              agent.update(agent.competition.copy(startDate = Some(season.startDate)))
            case _ =>
          }
        }
      }
    }.recover(footballClient.logErrorsWithMessage("Failed refreshing competitions data"))
  }

  def refreshMatchDay()(implicit executionContext: ExecutionContext): Future[immutable.Iterable[Competition]] = {
    log.info("Refreshing match day data")
    val result = getLiveMatches().map(_.map{ case (compId, newMatches) =>
      competitionAgents.find(_.competition.id == compId).map { agent =>
        agent.addMatches(newMatches)
      }
    })
    result.map(_.flatten).flatMap(Future.sequence(_))
  }
}

