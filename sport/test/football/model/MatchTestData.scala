package football.model

import org.joda.time.{DateMidnight, DateTime}
import pa._
import feed.CompetitionSupport
import model.Competition


trait MatchTestData {
  val now = DateTime.now()
  val today = DateMidnight.now()

  val spurs = MatchDayTeam("19", "Spurs", Some(4), Some(1), None, Some("Emmanuel Adebayor (19),Joe Paulo Paulinho (53),Emmanuel Adebayor (82),Nacer Chadli (88)"))
  val arsenal = MatchDayTeam("1006", "Arsenal", Some(0), Some(0), None, None)
  val manu = MatchDayTeam("12", "Man Utd", Some(0), Some(0), None, None)
  val newcastle = MatchDayTeam("31", "Newcastle", Some(0), Some(0), None, None)

  val stage = Stage("1")
  
  val matches1 = {
    Seq(
      Fixture("12", now.plusDays(10), stage, None, "1", spurs, manu, None, None),
      Fixture("11", now.plusDays(4), stage, None, "1", arsenal, manu, None, None),
      Fixture("10", now.plusDays(3), stage, None, "1", newcastle, arsenal, None, None),
      Fixture("9", now.plusDays(1), stage, None, "1", newcastle, arsenal, None, None),
      MatchDay("8", now.plusMinutes(120), None, None, "1", false, false, false, false, false, "-", None, newcastle, manu, None, None, None),
      MatchDay("7", now.plusMinutes(50), None, None, "1", false, false, false, false, true, "-", None, arsenal, spurs, None, None, None),
      MatchDay("6", now.minusMinutes(25), None, None, "1", true, false, false, false, true, "-", None, newcastle, manu, None, None, None),
      MatchDay("5", now.minusMinutes(60), None, None, "1", true, false, false, false, true, "-", None, manu, spurs, None, None, None),
      MatchDay("4", now.minusMinutes(150), None, None, "1", false, true, false, true, true, "-", None, manu, newcastle, None, None, None),
      Result("3", now.minusDays(1), None, "1", reportAvailable = true, Some("60021"), arsenal, manu, None, None, None),
      Result("2", now.minusDays(2), None, "1", reportAvailable = true, Some("48264"), arsenal, newcastle, None, None, None ),
      Result("1", now.minusDays(5), None, "1", reportAvailable = true, Some("48264"), spurs, newcastle, None, None, None)
    )
  }
  val matches2 = Seq(
    Fixture("36", now.plusDays(10), stage, None, "1", spurs, manu, None, None),
    Fixture("35", now.plusDays(4), stage, None, "1", newcastle, manu, None, None),
    Fixture("34", now.plusDays(1), stage, None, "1", arsenal, newcastle, None, None),
    MatchDay("33", now.plusMinutes(120), None, None, "1", false, false, false, false, false, "-", None, newcastle, manu, None, None, None),
    MatchDay("32", now.plusMinutes(80), None, None, "1", false, false, false, false, false, "-", None, newcastle, manu, None, None, None),
    MatchDay("31", now.minusMinutes(40), None, None, "1", true, false, false, false, true, "-", None, arsenal, spurs, None, None, None),
    Result("30", now.minusDays(2), None, "1", true, None, newcastle, manu, None, None, None)
  )
  val leagueTable1 = Seq()
  val leagueTable2 = Seq()
  val competitions = CompetitionSupport(Seq(
    Competition("1", "/football/test", "Test competition", "Test comp", "English", Some(today.minusDays(-50)), matches1, leagueTable1, showInTeamsList = true),
    Competition("2", "/football/test2", "Test competition 2", "Test comp 2", "Scottish", Some(today.minusDays(50)), matches2, leagueTable2, showInTeamsList = true)
  ))
}
