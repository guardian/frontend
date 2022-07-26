package football.model

import java.time.ZonedDateTime
import pa._
import model.Competition
import java.time.temporal.ChronoUnit

trait CompetitionTestData {
  val now = ZonedDateTime.now()
  val startOfDay = now.truncatedTo(ChronoUnit.DAYS)

  val teams = (0 until 16).map { i =>
    val idStr = i.toString
    MatchDayTeam(idStr, s"Test $idStr", Some(0), Some(0), None, None)
  }
  val quarterFinals = Round("1", Some("Quarter Final"))
  val semiFinals = Round("2", Some("Semi-final"))
  val thirdPlacePlayoff = Round("2", Some("3rd/4th Play-Offs"))
  val `final` = Round("2", Some("Final"))
  val knockoutRounds = List(quarterFinals, semiFinals, thirdPlacePlayoff, `final`)

  private val _matchDay = MatchDay(
    "1234",
    startOfDay,
    None,
    Stage("1"),
    Round("1", None),
    "1",
    true,
    false,
    true,
    false,
    true,
    "KO",
    None,
    teams(0),
    teams(1),
    None,
    None,
    None,
  )
  private val _fixture =
    Fixture("1234", startOfDay, Stage("1"), Round("1", None), "1", teams(0), teams(1), None, None)
  private val _result = Result(
    "1234",
    startOfDay,
    Stage("1"),
    Round("1", None),
    "1",
    false,
    None,
    teams(0),
    teams(1),
    None,
    None,
    None,
  )

  private def liveMatch(
      date: ZonedDateTime,
      stage: Stage,
      round: Round,
      leg: String,
      homeTeam: MatchDayTeam = _matchDay.homeTeam,
      awayTeam: MatchDayTeam = _matchDay.awayTeam,
  ): MatchDay =
    _matchDay.copy(
      date = date,
      stage = stage,
      round = round,
      leg = leg,
      homeTeam = homeTeam,
      awayTeam = awayTeam,
    )
  private def fixture(
      date: ZonedDateTime,
      stage: Stage,
      round: Round,
      leg: String,
      homeTeam: MatchDayTeam = _fixture.homeTeam,
      awayTeam: MatchDayTeam = _fixture.awayTeam,
  ): Fixture =
    _fixture.copy(
      date = date,
      stage = stage,
      round = round,
      leg = leg,
      homeTeam = homeTeam,
      awayTeam = awayTeam,
    )
  private def result(
      date: ZonedDateTime,
      stage: Stage,
      round: Round,
      leg: String,
      homeTeam: MatchDayTeam = _result.homeTeam,
      awayTeam: MatchDayTeam = _result.awayTeam,
  ): Result =
    _result.copy(
      date = date,
      stage = stage,
      round = round,
      leg = leg,
      homeTeam = homeTeam,
      awayTeam = awayTeam,
    )

  val pastLeagueMatches = {
    val stage = Stage("1")
    val round = Round("1", Some("League"))
    List(
      result(now.minusDays(10), stage, round, "1"),
      result(now.minusDays(9), stage, round, "1"),
      result(now.minusDays(9), stage, round, "1"),
      result(now.minusDays(8), stage, round, "1"),
      result(now.minusDays(7), stage, round, "1"),
    )
  }
  val currentLeagueMatches = {
    val stage = Stage("1")
    val round = Round("1", Some("League"))
    List(
      result(now.minusDays(1), stage, round, "1"),
      result(now.minusHours(9), stage, round, "1"),
      liveMatch(now.minusMinutes(10), stage, round, "1"),
      fixture(now.plusHours(5), stage, round, "1"),
      fixture(now.plusDays(1), stage, round, "1"),
    )
  }
  def futureLeagueMatches(stage: Stage): List[Fixture] = {
    val round = Round("1", Some("League"))
    List(
      fixture(now.plusDays(7), stage, round, "1"),
      fixture(now.plusDays(8), stage, round, "1"),
      fixture(now.plusDays(9), stage, round, "1"),
      fixture(now.plusDays(9), stage, round, "1"),
      fixture(now.plusDays(10), stage, round, "1"),
    )
  }

  val pastGroupMatches: List[Result] = {
    val stage = Stage("1")
    List(
      result(now.minusDays(10), stage, Round("1", Some("Group A")), "1", teams(0), teams(4)),
      result(now.minusDays(9), stage, Round("2", Some("Group B")), "1", teams(1), teams(5)),
      result(now.minusDays(9), stage, Round("3", Some("Group C")), "1", teams(2), teams(6)),
      result(now.minusDays(8), stage, Round("4", Some("Group D")), "1", teams(3), teams(7)),
      result(now.minusDays(10), stage, Round("1", Some("Group A")), "1", teams(8), teams(12)),
      result(now.minusDays(9), stage, Round("2", Some("Group B")), "1", teams(9), teams(13)),
      result(now.minusDays(9), stage, Round("3", Some("Group C")), "1", teams(10), teams(14)),
      result(now.minusDays(8), stage, Round("4", Some("Group D")), "1", teams(11), teams(15)),
    )
  }
  val currentGroupMatches: List[FootballMatch with Product with Serializable] = {
    val stage = Stage("1")
    List(
      result(now.minusDays(3), stage, Round("1", Some("Group A")), "1", teams(0), teams(4)),
      result(now.minusDays(2), stage, Round("2", Some("Group B")), "1", teams(1), teams(5)),
      result(now.minusDays(1), stage, Round("3", Some("Group C")), "1", teams(2), teams(6)),
      liveMatch(now.minusHours(1), stage, Round("4", Some("Group D")), "1", teams(3), teams(7)),
      liveMatch(now.minusMinutes(10), stage, Round("1", Some("Group A")), "1", teams(8), teams(12)),
      fixture(now.plusDays(1), stage, Round("2", Some("Group B")), "1", teams(9), teams(13)),
      fixture(now.plusDays(1), stage, Round("3", Some("Group C")), "1", teams(10), teams(14)),
      fixture(now.plusDays(2), stage, Round("4", Some("Group D")), "1", teams(11), teams(15)),
    )
  }
  def futureGroupMatches(stage: Stage): List[Fixture] = {
    List(
      fixture(now.plusDays(1), stage, Round("1", Some("Group A")), "1", teams(0), teams(4)),
      fixture(now.plusDays(1), stage, Round("2", Some("Group B")), "1", teams(1), teams(5)),
      fixture(now.plusDays(1), stage, Round("3", Some("Group C")), "1", teams(2), teams(6)),
      fixture(now.plusDays(1), stage, Round("4", Some("Group D")), "1", teams(3), teams(7)),
      fixture(now.plusDays(2), stage, Round("1", Some("Group A")), "1", teams(8), teams(12)),
      fixture(now.plusDays(2), stage, Round("2", Some("Group B")), "1", teams(9), teams(13)),
      fixture(now.plusDays(3), stage, Round("3", Some("Group C")), "1", teams(10), teams(14)),
      fixture(now.plusDays(4), stage, Round("4", Some("Group D")), "1", teams(11), teams(15)),
    )
  }

  def pastKnockoutMatches(stage: Stage): List[Result] = {
    List(
      result(now.minusDays(7), stage, quarterFinals, "1", teams(6), teams(7)),
      result(now.minusDays(7), stage, quarterFinals, "1", teams(2), teams(3)),
      result(now.minusDays(7), stage, quarterFinals, "1", teams(4), teams(5)),
      result(now.minusDays(7), stage, quarterFinals, "1", teams(0), teams(1)),
      result(now.minusDays(5), stage, semiFinals, "1", teams(4), teams(6)),
      result(now.minusDays(5), stage, semiFinals, "1", teams(0), teams(2)),
      result(now.minusDays(3), stage, thirdPlacePlayoff, "1", teams(2), teams(6)),
      result(now.minusDays(1), stage, `final`, "1", teams(0), teams(4)),
    )
  }
  def currentKnockoutMatches(stage: Stage): List[FootballMatch] = {
    List(
      result(now.minusDays(2), stage, quarterFinals, "1", teams(0), teams(1)),
      result(now.minusDays(2), stage, quarterFinals, "1", teams(2), teams(3)),
      result(now.minusDays(2), stage, quarterFinals, "1", teams(4), teams(5)),
      result(now.minusDays(2), stage, quarterFinals, "1", teams(5), teams(7)),
      liveMatch(now.minusHours(1), stage, semiFinals, "1", teams(0), teams(2)),
      liveMatch(now.minusHours(1), stage, semiFinals, "1", teams(4), teams(6)),
      fixture(now.plusDays(1), stage, thirdPlacePlayoff, "1", teams(2), teams(6)),
      fixture(now.plusDays(3), stage, `final`, "1", teams(0), teams(4)),
    )
  }
  def betweenRoundsKnockoutMatches(stage: Stage): List[FootballMatch] = {
    List(
      result(now.minusDays(2), stage, quarterFinals, "1", teams(0), teams(1)),
      result(now.minusDays(2), stage, quarterFinals, "1", teams(2), teams(3)),
      result(now.minusDays(2), stage, quarterFinals, "1", teams(4), teams(5)),
      result(now.minusDays(2), stage, quarterFinals, "1", teams(5), teams(7)),
      result(now.minusHours(4), stage, semiFinals, "1", teams(0), teams(2)),
      result(now.minusHours(3), stage, semiFinals, "1", teams(4), teams(6)),
      fixture(now.plusDays(1), stage, thirdPlacePlayoff, "1", teams(2), teams(6)),
      fixture(now.plusDays(3), stage, `final`, "1", teams(0), teams(4)),
    )
  }
  def futureKnockoutMatches(stage: Stage): List[Fixture] = {
    List(
      fixture(now.plusDays(1), stage, quarterFinals, "1", teams(0), teams(1)),
      fixture(now.plusDays(1).plusMinutes(5), stage, quarterFinals, "1", teams(2), teams(3)),
      fixture(now.plusDays(1).plusMinutes(10), stage, quarterFinals, "1", teams(4), teams(5)),
      fixture(now.plusDays(1).plusMinutes(15), stage, quarterFinals, "1", teams(5), teams(7)),
      fixture(now.plusDays(3), stage, semiFinals, "1", teams(0), teams(2)),
      fixture(now.plusDays(3), stage, semiFinals, "1", teams(4), teams(6)),
      fixture(now.plusDays(5), stage, thirdPlacePlayoff, "1", teams(2), teams(6)),
      fixture(now.plusDays(7), stage, `final`, "1", teams(0), teams(4)),
    )
  }

  def currentKnockoutMatchesWithLegs(stage: Stage): List[FootballMatch] = {
    List(
      result(now.minusDays(4), stage, quarterFinals, "1", teams(0), teams(1)),
      result(now.minusDays(4), stage, quarterFinals, "1", teams(2), teams(3)),
      result(now.minusDays(4), stage, quarterFinals, "1", teams(4), teams(5)),
      result(now.minusDays(4), stage, quarterFinals, "1", teams(5), teams(7)),
      result(now.minusDays(2), stage, quarterFinals, "2", teams(1), teams(0)),
      result(now.minusDays(2), stage, quarterFinals, "2", teams(3), teams(2)),
      result(now.minusDays(2), stage, quarterFinals, "2", teams(5), teams(4)),
      result(now.minusDays(2), stage, quarterFinals, "2", teams(7), teams(5)),
      liveMatch(now.minusHours(1), stage, semiFinals, "1", teams(0), teams(2)),
      liveMatch(now.minusHours(1), stage, semiFinals, "1", teams(4), teams(6)),
      fixture(now.plusDays(1), stage, semiFinals, "2", teams(2), teams(0)),
      fixture(now.plusDays(1), stage, semiFinals, "2", teams(6), teams(4)),
      fixture(now.plusDays(2), stage, thirdPlacePlayoff, "1", teams(2), teams(6)),
      fixture(now.plusDays(3), stage, `final`, "1", teams(0), teams(4)),
    )
  }

  val currentMatchesWithoutAnyStage = {
    val stage = Stage("1")
    val round = Round("1", Some("Cup"))
    val leg = "1"
    List(
      result(now.minusDays(1), stage, round, leg),
      result(now.minusHours(9), stage, round, leg),
      liveMatch(now.minusMinutes(10), stage, round, leg),
      fixture(now.plusHours(5), stage, round, leg),
      fixture(now.plusDays(1), stage, round, leg),
    )
  }

  def testCompetition(leagueTable: Seq[LeagueTableEntry], matches: List[FootballMatch]): Competition = {
    Competition(
      matches = matches,
      leagueTable = leagueTable,
      id = "1",
      url = "test/url",
      fullName = "Competition Name",
      shortName = "Short name",
      nation = "English",
      startDate = Some(startOfDay.minusDays(50).toLocalDate()),
      showInTeamsList = false,
      tableDividers = Nil,
    )
  }

  def makeLeagueTable(stage: Stage, round: Int => Round): Seq[LeagueTableEntry] =
    teams.zipWithIndex.map {
      case (matchDayTeam, index) =>
        val leagueTeam = LeagueTeam(
          matchDayTeam.id,
          matchDayTeam.name,
          index,
          LeagueStats(4, 5, 2, 1, 5, 5),
          LeagueStats(4, 5, 2, 1, 5, 5),
          LeagueStats(4, 5, 2, 1, 5, 5),
          0,
          20 - index,
        )
        LeagueTableEntry(stage.stageNumber, round(index), leagueTeam)
    }
  def leagueTable(stage: Stage, round: Round): Seq[LeagueTableEntry] = makeLeagueTable(stage, _ => round)
  def groupTables(stage: Stage): Seq[LeagueTableEntry] = {
    val groups = List(
      Round("1", Some("Group A")),
      Round("2", Some("Group B")),
      Round("3", Some("Group C")),
      Round("4", Some("Group D")),
    )
    makeLeagueTable(stage, i => groups(i % 4))
  }

  implicit def dateTimeOrdering: Ordering[ZonedDateTime] = Ordering.fromLessThan(_ isBefore _)

  // Premier League
  val league = testCompetition(
    leagueTable = leagueTable(Stage("1"), Round("1", Some("League"))),
    matches = currentLeagueMatches.sortBy(_.date),
  )
  // FA-cup
  val tournament = testCompetition(
    leagueTable = Nil,
    matches = currentKnockoutMatches(Stage("1")).sortBy(_.date),
  )
  // Championship league / playoffs
  val leagueWithPlayoffs = testCompetition(
    leagueTable = leagueTable(Stage("1"), Round("1", Some("League"))),
    matches = (pastLeagueMatches ++ futureKnockoutMatches(Stage("2"))).sortBy(_.date),
  )
  // World-cup
  val groupsThenKnockout = testCompetition(
    leagueTable = groupTables(Stage("1")),
    matches = (pastGroupMatches ++ currentKnockoutMatches(Stage("2"))).sortBy(_.date),
  )
  // Champions' league league
  val groupsThenKnockoutWithLegs = testCompetition(
    leagueTable = groupTables(Stage("1")),
    matches = (pastGroupMatches ++ currentKnockoutMatchesWithLegs(Stage("2"))).sortBy(_.date),
  )
  // World cup qualifiers
  val groupStage = testCompetition(
    leagueTable = groupTables(Stage("1")),
    matches = currentGroupMatches.sortBy(_.date),
  )
  // International friendlies
  val stageless = testCompetition(
    leagueTable = Nil,
    matches = currentMatchesWithoutAnyStage.sortBy(_.date),
  )
}
