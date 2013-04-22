package test

import model.Competition
import org.scala_tools.time.Imports._
import org.joda.time.DateTime
import pa._
import model.Competition
import pa.MatchDayTeam
import pa.MatchDay
import pa.Stage
import scala.Some
import pa.Fixture


trait FootballTestData {

  private val today = new org.joda.time.DateTime()

  private val team = new MatchDayTeam("1", "Team name", None, None, None, None)

  private val matchDay = MatchDay("1234", today.toDateTime, None, None, "1", true, false, true, false, true, "KO", None, team, team, None, None, None)

  private val _fixture = Fixture("1234", today.toDateTime, Stage("1"), None, "1", team, team,None, None)

  private val _result = Result("1234", today.toDateTime,  None, "1", false, None, team, team,None, None, None)

  val competitions = Seq(
    Competition("100", "/football/premierleague", "Premier League", "Premier League", "English",
      showInTeamsList = true,
      startDate = Some((today - 2.months).toDateMidnight),
      matches = Seq(
        result("Stoke", "Villa", 1, 1, today - 4.days),
        result("Fulham", "Norwich", 0, 0, today - 3.days),
        result("Wigan", "Everton", 1, 1, today - 1.day),
        result("Sunderland", "West Ham", 1, 1, today.withTime(13, 0, 0, 0)),
        liveMatch("Arsenal", "Spurs", 1, 0, today.withTime(15, 0, 0, 0)),
        liveMatch("Chelsea", "Man U", 0, 0, today.withTime(15, 0, 0, 0)),
        fixture("Liverpool", "Man C", today + 2.days),
        fixture("Wigan", "Fulham", today + 2.days),
        fixture("Stoke", "Everton", today + 3.days),
        fixture("Reading", "QPR", today + 4.days),
        fixture("Swansea", "Reading", today + 5.days)
      ),
      leagueTable = Seq(
        leagueEntry("Arsenal", 1),
        leagueEntry("Man C", 2),
        leagueEntry("Man U", 3),
        leagueEntry("Chelsea", 4),
        leagueEntry("Wigan", 5),
        leagueEntry("Everton", 6),
        leagueEntry("Liverpool", 7)
      )

    ),
    Competition("500", "/football/championsleague", "Champions League", "Champions League", "European",
      startDate = Some((today - 2.months).toDateMidnight),
      matches = Seq(
        result("Bolton", "Derby", 1, 1, today - 1.day),
        liveMatch("Cardiff", "Brighton", 2, 0, today.withTime(15, 0, 0, 0)),
        fixture("Wolves", "Burnley", today + 2.days)
      ),
      leagueTable = Seq(
        leagueEntry("Bolton", 1),
        leagueEntry("Cardiff", 2)
      )
    )
  )



  private def liveMatch(homeName: String, awayName: String, homeScore: Int, awayScore: Int, date: DateTime) = matchDay.copy(
    id = s"$homeName $awayName $date",
    date = date,
    homeTeam = team.copy(id = homeName, name = homeName, score = Some(homeScore)),
    awayTeam = team.copy(id = awayName, name = awayName, score = Some(awayScore))
  )

  private def fixture(homeName: String, awayName: String, date: DateTime) = _fixture.copy(
    id = s"$homeName $awayName $date",
    date = date,
    homeTeam = team.copy(id = homeName, name = homeName, score = None),
    awayTeam = team.copy(id = awayName, name = awayName, score = None)
  )

  private def result(homeName: String, awayName: String, homeScore: Int, awayScore: Int, date: DateTime) = _result.copy(
    id = s"$homeName $awayName $date",
    date = date,
    homeTeam = team.copy(id = homeName, name = homeName, score = Some(homeScore)),
    awayTeam = team.copy(id = awayName, name = awayName, score = Some(awayScore))
  )

  private def leagueEntry(team: String, rank: Int) = LeagueTableEntry("1", None,
    LeagueTeam(team, team, rank, LeagueStats(10, 5, 5, 0, 3, 2),
      LeagueStats(10, 5, 5, 0, 3, 2), LeagueStats(10, 5, 5, 0, 3, 2), 3, 30))
}