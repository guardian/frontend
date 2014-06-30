package football.model

import org.joda.time.{DateTimeZone, DateMidnight, DateTime}
import pa._
import feed.CompetitionSupport
import model.Competition


trait MatchTestData {
  val now = DateTime.now(DateTimeZone.forID("Europe/London"))
  val today = DateMidnight.now(DateTimeZone.forID("Europe/London"))

  val spurs = MatchDayTeam("19", "Spurs", Some(4), Some(1), None, Some("Emmanuel Adebayor (19),Joe Paulo Paulinho (53),Emmanuel Adebayor (82),Nacer Chadli (88)"))
  val arsenal = MatchDayTeam("1006", "Arsenal", Some(0), Some(0), None, None)
  val manu = MatchDayTeam("12", "Man Utd", Some(0), Some(0), None, None)
  val newcastle = MatchDayTeam("31", "Newcastle", Some(0), Some(0), None, None)

  val stage = Stage("1")
  val round1 = Round("1", None)
  val round2 = Round("2", None)

  // this testdata (and thus also the tests) uses relative times so the tests always work
  val matches1 = Seq(
    Fixture("13", now.plusDays(11), stage, round1, "1", newcastle, manu, None, None),
    Fixture("12", now.plusDays(10), stage, round2, "1", spurs, manu, None, None),
    Fixture("11", now.plusDays(4), stage, round1, "1", arsenal, spurs, None, None),
    Fixture("10", now.plusDays(3), stage, round1, "1", newcastle, arsenal, None, None),
    Fixture("9", now.plusDays(1), stage, round1, "1", newcastle, arsenal, None, None),
    MatchDay("8", now.plusMinutes(120), None, Stage("1"), round2, "1", false, false, false, false, false, "-", None, newcastle, manu, None, None, None),
    MatchDay("7", now.plusMinutes(50), None, Stage("1"), round1, "1", false, false, false, false, true, "-", None, arsenal, spurs, None, None, None),
    MatchDay("6", now.minusMinutes(25), None, Stage("1"), round1, "1", true, false, false, false, true, "KO", None, newcastle, manu, None, None, None),
    MatchDay("5", now.minusMinutes(60), None, Stage("1"), round1, "1", true, false, false, false, true, "2nd", None, manu, spurs, None, None, None),
    MatchDay("4", now.minusMinutes(150), None, Stage("1"), round1, "1", false, true, false, true, true, "FT", None, spurs, newcastle, None, None, None),
    Result("3", now.minusDays(1), Stage("1"), round2, "1", reportAvailable = true, Some("60021"), arsenal, manu, None, None, None),
    Result("2", now.minusDays(2), Stage("1"), round1, "1", reportAvailable = true, Some("48264"), arsenal, newcastle, None, None, None ),
    Result("1", now.minusDays(5), Stage("1"), round1, "1", reportAvailable = true, Some("48264"), spurs, newcastle, None, None, None)
  )
  val matches2 = Seq(
    Fixture("36", now.plusDays(10), stage, round1, "2", spurs, manu, None, None),
    Fixture("35", now.plusDays(4), stage, round1, "1", newcastle, manu, None, None),
    Fixture("34", now.plusDays(1), stage, round1, "1", arsenal, newcastle, None, None),
    MatchDay("33", now.plusMinutes(125), None, Stage("1"), round2, "1", false, false, false, false, false, "-", None, newcastle, manu, None, None, None),
    MatchDay("32", now.plusMinutes(80), None, Stage("1"), round1, "1", false, false, false, false, false, "-", None, newcastle, manu, None, None, None),
    MatchDay("31", now.minusMinutes(40), None, Stage("1"), round1, "1", true, false, false, false, true, "1st", None, arsenal, spurs, None, None, None),
    Result("30", now.minusDays(2), Stage("1"), Round("1", None), "2", true, None, newcastle, manu, None, None, None)
  )
  val leagueTable1 = Seq()
  val leagueTable2 = Seq()

  val competition1 = Competition("500", "/football/test", "Test competition", "Test comp", "English", Some(today.minusDays(50)), matches1, leagueTable1, showInTeamsList = true)
  val competition2 = Competition("100", "/football/test2", "Test competition 2", "Test comp 2", "Scottish", Some(today.minusDays(50)), matches2, leagueTable2, showInTeamsList = true)

  val competitions = CompetitionSupport(Seq(competition1, competition2))
}
