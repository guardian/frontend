package test

import conf.FootballClient
import feed.CompetitionsService
import model.{Competition, Tag, TagProperties, TeamMap}
import pa._

import java.time.{ZoneId, ZonedDateTime, LocalTime}
import java.time.format.DateTimeFormatter

trait FootballTestData {

  def testFootballClient: FootballClient

  lazy val testCompetitionsService = {
    val service = new CompetitionsService(testFootballClient, FootballTestData.competitions)
    service.loadTestData()
    service
  }

  implicit class TestCompetitionsService(competitionsService: CompetitionsService) {
    def loadTestData(): Unit = {
      if (competitionsService.matches.isEmpty) {
        competitionsService.competitionAgents.foreach { agent =>
          FootballTestData.competitions.filter(_.id == agent.competition.id).map { comp =>
            agent.update(comp)
            agent.addMatches(comp.matches)
          }
        }
      }
      if (TeamMap.teamAgent.get().isEmpty) {
        TeamMap.teamAgent.send(old => old ++ FootballTestData.teamTags)
      }
    }
  }
}

object FootballTestData {

  private val zone = ZoneId.of("Europe/London")

  private val today = ZonedDateTime.now().withZoneSameInstant(zone)

  private val team = MatchDayTeam("1", "Team name", None, None, None, None)

  private val matchDay = MatchDay(
    "1234",
    today,
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
    team,
    team,
    None,
    None,
    None,
  )

  private val _fixture = Fixture("1234", today, Stage("1"), Round("1", None), "1", team, team, None, None)

  private val _result =
    Result("1234", today, Stage("1"), Round("1", None), "1", false, None, team, team, None, None, None)

  private val matchWithReport = Result(
    "1010",
    ZonedDateTime.of(2012, 12, 1, 15, 0, 0, 0, zone),
    Stage("1"),
    Round("1", None),
    "",
    false,
    None,
    MatchDayTeam("1006", "", None, None, None, None),
    MatchDayTeam("65", "", None, None, None, None),
    None,
    None,
    None,
  )

  val competitions = Seq(
    Competition(
      "100",
      "/football/premierleague",
      "Premier League",
      "Premier League",
      "English",
      showInTeamsList = true,
      startDate = Some((today.minusMonths(2)).toLocalDate),
      matches = Seq(
        matchWithReport,
        result("Derby", "Blackburn", 0, 1, today.minusDays(5)),
        result("Stoke", "Villa", 1, 1, today.minusDays(4)).copy(id = "3834132"),
        result("Fulham", "Norwich", 0, 0, today.minusDays(3)),
        result("Wigan", "Everton", 1, 1, today.minusDays(1)),
        result("Sunderland", "West Ham", 1, 1, today.`with`(LocalTime.of(13, 0))),
        liveMatch("Arsenal", "Spurs", 1, 0, today.`with`(LocalTime.of(15, 0)), true),
        liveMatch("Chelsea", "Man U", 0, 0, today.`with`(LocalTime.of(15, 0)), true),
        fixture("Liverpool", "Man C", today.plusDays(2)),
        fixture("Wigan", "Fulham", today.plusDays(2)),
        fixture("Stoke", "Everton", today.plusDays(3)),
        fixture("Reading", "QPR", today.plusDays(4)),
        fixture("Swansea", "Reading", today.plusDays(5)),
      ),
      leagueTable = Seq(
        leagueEntry("Arsenal", 1),
        leagueEntry("Man C", 2),
        leagueEntry("Man U", 3),
        leagueEntry("Chelsea", 4),
        leagueEntry("Wigan", 5),
        leagueEntry("Everton", 6),
        leagueEntry("Liverpool", 7),
      ),
    ),
    Competition(
      "500",
      "/football/championsleague",
      "Champions League",
      "Champions League",
      "European",
      startDate = Some((today.minusMonths(2)).toLocalDate),
      matches = Seq(
        result("Bolton", "Derby", 1, 1, today.minusDays(1), Some("Bolton win 4-2 on penalties.")),
        liveMatch("Cardiff", "Brighton", 2, 0, today.`with`(LocalTime.of(15, 0)), true),
        fixture("Wolves", "Burnley", today.plusDays(2)),
      ),
      leagueTable = Seq(
        leagueEntry("Bolton", 1),
        leagueEntry("Cardiff", 2),
      ),
    ),
  )

  val teamTags: Map[String, Tag] = Map(
    "Liverpool" -> Tag(
      TagProperties(
        "football/liverpool",
        "/football/liverpool",
        "Keyword",
        "football",
        "Football",
        "Liverpool",
        "https://www.theguardian.com/football/liverpool",
        None,
        None,
        None,
        None,
        None,
        None,
        None,
        Seq(),
        None,
        None,
      ),
      None,
      None,
    ),
  )

  def liveMatch(
      homeName: String,
      awayName: String,
      homeScore: Int,
      awayScore: Int,
      date: ZonedDateTime,
      isLive: Boolean,
  ) =
    matchDay.copy(
      id = s"liveMatch $homeName $awayName ${date.format(DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ssZ"))}",
      date = date,
      homeTeam = team.copy(id = homeName, name = homeName, score = Some(homeScore)),
      awayTeam = team.copy(id = awayName, name = awayName, score = Some(awayScore)),
      liveMatch = isLive,
    )

  def fixture(homeName: String, awayName: String, date: ZonedDateTime) =
    _fixture.copy(
      id = s"fixture $homeName $awayName ${date.format(DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ssZ"))}",
      date = date,
      homeTeam = team.copy(id = homeName, name = homeName, score = None),
      awayTeam = team.copy(id = awayName, name = awayName, score = None),
    )

  def result(
      homeName: String,
      awayName: String,
      homeScore: Int,
      awayScore: Int,
      date: ZonedDateTime,
      comments: Option[String] = None,
  ) =
    _result.copy(
      id = s"result $homeName $awayName ${date.format(DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ssZ"))}",
      date = date,
      homeTeam = team.copy(id = homeName, name = homeName, score = Some(homeScore)),
      awayTeam = team.copy(id = awayName, name = awayName, score = Some(awayScore)),
      comments = comments,
    )

  private def leagueEntry(team: String, rank: Int) =
    LeagueTableEntry(
      "1",
      Round("1", None),
      LeagueTeam(
        team,
        team,
        rank,
        LeagueStats(10, 5, 5, 0, 3, 2),
        LeagueStats(10, 5, 5, 0, 3, 2),
        LeagueStats(10, 5, 5, 0, 3, 2),
        3,
        30,
      ),
    )

}
