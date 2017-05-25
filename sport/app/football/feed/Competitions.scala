package feed

import common._
import conf.FootballClient
import java.util.Comparator

import model.{Competition, Table, TeamFixture, TeamNameBuilder}
import org.joda.time.{DateTimeComparator, LocalDate}
import org.scala_tools.time.Imports._
import pa._

import scala.concurrent.Future


trait Competitions extends implicits.Football {

  private implicit val localDateOrdering = Ordering.comparatorToOrdering(
    DateTimeComparator.getInstance.asInstanceOf[Comparator[LocalDate]]
  )

  def competitions: Seq[Competition]

  def competitionsWithCompetitionFilter(path: String) = Competitions(
    competitions.filter(_.url == path)
  )

  def competitionsWithTag(tag: String) = competitions.find(_.url.endsWith(tag))

  def competitionsWithId(compId: String) = competitions.find(_.id == compId)

  lazy val competitionsWithTodaysMatchesAndFutureFixtures = Competitions(
    competitions.map(c => c.copy(matches = c.matches.filter(m => m.isFixture || m.isOn(new LocalDate)))).filter(_.hasMatches)
  )

  lazy val competitionsWithTodaysMatchesAndPastResults = Competitions(
    competitions.map(c => c.copy(matches = c.matches.filter(m => m.isResult || m.isOn(new LocalDate)))).filter(_.hasMatches)
  )

  lazy val withTodaysMatches = Competitions(
    competitions.map(c => c.copy(matches = c.matches.filter(_.isOn(new LocalDate)))).filter(_.hasMatches)
  )

  def withTeam(team: String) = Competitions(
    competitions.filter(_.hasLeagueTable).filter(_.leagueTable.exists(_.team.id == team))
  )

  def mostPertinentCompetitionForTeam(teamId: String) =
    withTeam(teamId).competitions.sortBy({ competition =>
      val table = Table(competition)
      val group = table.groups.find(_.entries.exists(_.team.id == teamId))
      -(group.map(_.entries.length) getOrElse competition.leagueTable.length)
    }).headOption

  lazy val matchDates = competitions.flatMap(_.matchDates).distinct.sorted

  def nextMatchDates(startDate: LocalDate, numDays: Int) = matchDates.filter(_ >= startDate).take(numDays)

  def previousMatchDates(date: LocalDate, numDays: Int) = matchDates.reverse.filter(_ <= date).take(numDays)

  def findMatch(id: String): Option[FootballMatch] = matches.find(_.id == id)

  def competitionForMatch(matchId: String): Option[Competition] =
    competitions.find(_.matches.exists(_.id == matchId))

  def withTeamMatches(teamId: String) = competitions.filter(_.hasMatches).flatMap(c =>
    c.matches.filter(m => m.homeTeam.id == teamId || m.awayTeam.id == teamId).sortByDate.map { m =>
      TeamFixture(c, m)
    }
  )

  def findTeam(teamId: String): Option[FootballTeam] = competitions.flatMap(_.teams).find(_.id == teamId).map { unclean =>
    MatchDayTeam(teamId, unclean.name, None, None, None, None)
  }

  def matchFor(date: LocalDate, homeTeamId: String, awayTeamId: String) =
    matches.find(m => m.homeTeam.id == homeTeamId && m.awayTeam.id == awayTeamId && m.date.toLocalDate == date)

  // note team1 & team2 are the home and away team, but we do NOT know their order
  def matchFor(interval: Interval, team1: String, team2: String): Option[FootballMatch] = matches
    .filter(m => interval.contains(m.date))
    .find(m => m.hasTeam(team1) && m.hasTeam(team2))

  def matches = competitions.flatMap(_.matches).sortByDate

}

object Competitions {
  def apply(comps: Seq[Competition]): Competitions = new Competitions {
    val competitions = comps
  }
}

// when updating this code, think about whether the mobile apps api needs to be updated too
// (https://github.com/guardian/mobile-apps-api/blob/master/mobile-football/app/data/pa/Competitions.scala)

object CompetitionsProvider {
  val allCompetitions: Seq[Competition] = Seq(
    Competition("500", "/football/championsleague", "Champions League", "Champions League", "European", tableDividers = List(2, 6, 21)),
    Competition("100", "/football/premierleague", "Premier League", "Premier League", "English", showInTeamsList = true, tableDividers = List(4, 5, 17)),
    Competition("300", "/football/fa-cup", "FA Cup", "FA Cup", "English"),
    Competition("650", "/football/laligafootball", "La Liga", "La Liga", "European", showInTeamsList = true, tableDividers = List(4, 6, 17)),
    Competition("625", "/football/bundesligafootball", "Bundesliga", "Bundesliga", "European", showInTeamsList = true, tableDividers = List(3, 4, 6, 15, 16)),
    Competition("635", "/football/serieafootball", "Serie A", "Serie A", "European", showInTeamsList = true, tableDividers = List(3, 5, 17)),
    Competition("620", "/football/ligue1football", "Ligue 1", "Ligue 1", "European", showInTeamsList = true, tableDividers = List(3, 4, 17)),
    Competition("101", "/football/championship", "Championship", "Championship", "English", showInTeamsList = true, tableDividers = List(2, 6, 21)),
    Competition("120", "/football/scottish-premiership", "Scottish Premiership", "Scottish Premiership", "Scottish", showInTeamsList = true, tableDividers = List(1, 3, 6, 11)),
    Competition("102", "/football/leagueonefootball", "League One", "League One", "English", showInTeamsList = true, tableDividers = List(2, 6, 20)),
    Competition("103", "/football/leaguetwofootball", "League Two", "League Two", "English", showInTeamsList = true, tableDividers = List(3, 7, 22)),
    Competition("121", "/football/scottish-championship", "Scottish Championship", "Scottish Championship", "Scottish", showInTeamsList = true, tableDividers = List(1, 8, 9)),
    Competition("122", "/football/scottish-league-one", "Scottish League One", "Scottish League One", "Scottish", showInTeamsList = true, tableDividers = List(1, 4, 8, 9)),
    Competition("123", "/football/scottish-league-two", "Scottish League Two", "Scottish League Two", "Scottish", showInTeamsList = true, tableDividers = List(1, 4)),
    Competition("750", "/football/euro-2016", "Euro 2016", "Euro", "Internationals"),
    Competition("751", "/football/euro-2016-qualifiers", "Euro 2016 qualifying", "Euro 2016 qual.", "Internationals"),
    Competition("501", "/football/champions-league-qualifying", "Champions League qualifying", "Champions League qual.", "European"),
    Competition("510", "/football/uefa-europa-league", "Europa League", "Europa League", "European", tableDividers = List(2)),
    Competition("301", "/football/efl-cup", "EFL Cup", "EFL Cup", "English"),
    Competition("400", "/football/community-shield", "Community Shield", "Community Shield", "English", showInTeamsList = true),
    Competition("320", "/football/scottishcup", "Scottish Cup", "Scottish Cup", "Scottish"),
    Competition("321", "/football/cis-insurance-cup", "Scottish League Cup", "Scottish League Cup", "Scottish"),
    Competition("721", "/football/friendlies", "International friendlies", "Friendlies", "Internationals"),
    Competition("870", "/football/women-s-world-cup-2015", "Women's World Cup 2015", "Women's World Cup", "Internationals", showInTeamsList = true, tableDividers = List(2)),
    Competition("701", "/football/world-cup-2018-qualifiers", "World Cup 2018 Qualifiers", "World Cup 2018 qual.", "Internationals", showInTeamsList = true, tableDividers = List(2))
  )
}

class CompetitionsService(val footballClient: FootballClient, competitionDefinitions: Seq[Competition])
  extends Competitions
    with LiveMatches
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

  def refreshCompetitionAgent(id: String): Unit = competitionAgents
    .find { _.competition.id == id }
    .foreach { c =>
      c.refresh()
      log.info(s"Completed refresh of competition '${c.competition.fullName}': currently ${c.competition.matches.length} matches")
    }

  def refreshCompetitionData() = {
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
    }.recover(footballClient.logErrors)
  }

  def refreshMatchDay() = {
    log.info("Refreshing match day data")
    val result = getLiveMatches.map(_.map{ case (compId, newMatches) =>
      competitionAgents.find(_.competition.id == compId).map { agent =>
        agent.addMatches(newMatches)
      }
    })
    result.map(_.flatten).flatMap(Future.sequence(_))
  }
}

