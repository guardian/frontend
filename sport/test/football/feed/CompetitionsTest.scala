package football.feed

import java.time.{Clock, Duration, LocalTime, ZoneId, ZonedDateTime}
import java.time.format.DateTimeFormatter
import org.scalatest._
import feed.Competitions
import football.model.CompetitionTestData
import model.Competition
import pa.{
  Fixture,
  FootballMatch,
  LeagueStats,
  LeagueTableEntry,
  LeagueTeam,
  MatchDay,
  MatchDayTeam,
  Result,
  Round,
  Stage,
}

class CompetitionsTest extends FreeSpec with Matchers with OptionValues {
  "Competitions" - {
    Seq(
      (Duration.ofSeconds(1), true),
      (Duration.ofMinutes(1), true),
      (Duration.ofMinutes(4).plusSeconds(59), true),
    ) foreach { testcase =>
      ("isAMatchInProgress return true if there's a match that started " + testcase._1 + " minutes ago") in {
        val matches: Seq[FootballMatch] =
          FootballTestData.matchesWithLiveMatchAtCurrentMinusDuration(testcase._1)
        val testCompetition = FootballTestData.competitions(1).copy(matches = matches)
        val competitions = Competitions(Seq(testCompetition))

        val isAMatchInProgress = competitions.isAMatchInProgress(competitions.matches, FootballTestData.clock)

        isAMatchInProgress should equal(testcase._2)
      }
    }
  }

  // I had trouble using the original FootballTestData because it needed testFootballClient
  // And in my test I didn't need any client at all. As it's testing the Competitions methods
  // For now I copied the things from the original FootballTestData until I figure out how to fix this
  object FootballTestData {
    private val zone = ZoneId.of("Europe/London")
    val today = ZonedDateTime.now().withZoneSameInstant(zone)

    val clock = {
      val fixedDate = today.toInstant
      Clock.fixed(fixedDate, zone)
    }

    private val team = MatchDayTeam("1", "Team name", None, None, None, None)

    private val matchDay = (isLive: Boolean) =>
      MatchDay(
        "1234",
        today,
        None,
        Stage("1"),
        Round("1", None),
        "1",
        isLive,
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
          result("Derby", "Blackburn", 0, 1, today.minusDays(5)),
          result("Stoke", "Villa", 1, 1, today.minusDays(4)).copy(id = "3834132"),
          result("Fulham", "Norwich", 0, 0, today.minusDays(3)),
          result("Wigan", "Everton", 1, 1, today.minusDays(1)),
          result("Sunderland", "West Ham", 1, 1, today.`with`(LocalTime.of(13, 0))),
          liveMatch(true, "Arsenal", "Spurs", 1, 0, today.`with`(LocalTime.of(15, 0))),
          liveMatch(true, "Chelsea", "Man U", 0, 0, today.`with`(LocalTime.of(15, 0))),
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
          liveMatch(true, "Cardiff", "Brighton", 2, 0, today.`with`(LocalTime.of(15, 0))),
          fixture("Wolves", "Burnley", today.plusDays(2)),
        ),
        leagueTable = Seq(
          leagueEntry("Bolton", 1),
          leagueEntry("Cardiff", 2),
        ),
      ),
    )

    private def liveMatch(
        isLive: Boolean,
        homeName: String,
        awayName: String,
        homeScore: Int,
        awayScore: Int,
        date: ZonedDateTime,
    ) =
      matchDay(isLive).copy(
        id = s"liveMatch $homeName $awayName ${date.format(DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ssZ"))}",
        date = date,
        homeTeam = team.copy(id = homeName, name = homeName, score = Some(homeScore)),
        awayTeam = team.copy(id = awayName, name = awayName, score = Some(awayScore)),
      )

    private def fixture(homeName: String, awayName: String, date: ZonedDateTime) =
      _fixture.copy(
        id = s"fixture $homeName $awayName ${date.format(DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ssZ"))}",
        date = date,
        homeTeam = team.copy(id = homeName, name = homeName, score = None),
        awayTeam = team.copy(id = awayName, name = awayName, score = None),
      )

    private def result(
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

    // These are the values I added to use spesifically in the tests
    val matchesWithLiveMatchAtCurrentMinusDuration = (duration: Duration) => {
      Seq(
        result("Bolton", "Derby", 1, 1, today.minusDays(1), Some("Bolton win 4-2 on penalties.")),
        liveMatch(false, "Cardiff", "Brighton", 2, 0, today.minus(duration)),
        fixture("Wolves", "Burnley", today.plusDays(2)),
      )
    }

    val matchesWithLiveMatchAtCurrentPlusDuration = (duration: Duration) => {
      Seq(
        result("Bolton", "Derby", 1, 1, today.minusDays(1), Some("Bolton win 4-2 on penalties.")),
        liveMatch(false, "Cardiff", "Brighton", 2, 0, today.plus(duration)),
        fixture("Wolves", "Burnley", today.plusDays(2)),
      )
    }
  }

}
