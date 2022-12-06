package test
import scala.concurrent.Await
import feed.CompetitionsService
import model.Competition
import org.scalatest.{BeforeAndAfterAll, DoNotDiscover}
import org.scalatest.concurrent.{Eventually, ScalaFutures}
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers
import org.scalatest.time.{Millis, Span}
import test.FootballTestData.fixture

import java.time.{Clock, LocalDate, ZonedDateTime}
import java.time.ZoneId
import scala.concurrent.duration._

@DoNotDiscover class CompetitionAgentTest
    extends AnyFlatSpec
    with ConfiguredTestSuite
    with Matchers
    with implicits.Football
    with Eventually
    with BeforeAndAfterAll
    with WithMaterializer
    with WithTestWsClient
    with WithTestFootballClient
    with FootballTestData
    with WithTestExecutionContext
    with ScalaFutures {

  val fixedClock = {
    val fixedDate = ZonedDateTime.of(2016, 6, 22, 15, 0, 0, 0, ZoneId.systemDefault()).toInstant
    Clock.fixed(fixedDate, ZoneId.systemDefault())
  }

  override def afterAll(): Unit = {
    super.afterAll()
  }

  override implicit val patienceConfig =
    PatienceConfig(timeout = scaled(Span(3000, Millis)), interval = scaled(Span(100, Millis)))

  lazy val seasonStart = Some(LocalDate.of(2012, 8, 1))

  def testCompetitionsService(competition: Competition): CompetitionsService =
    new CompetitionsService(testFootballClient, Seq(competition))

  "CompetitionAgentTest" should "load fixtures" in {

    val comps = testCompetitionsService(
      Competition(
        "100",
        "/football/premierleague",
        "Premier League",
        "Premier League",
        "English",
        showInTeamsList = true,
      ),
    )
    comps.competitionAgents.foreach(_.refreshFixtures())

    eventually(
      comps.matches.filter(_.isFixture).map(_.id) should contain("3925232"),
    )
  }

  it should "load results" in {

    val comps = testCompetitionsService(
      Competition(
        "100",
        "/football/premierleague",
        "Premier League",
        "Premier League",
        "English",
        showInTeamsList = true,
        startDate = seasonStart,
      ),
    )
    comps.competitionAgents.foreach(_.refreshResults(fixedClock))

    eventually(
      comps.matches.filter(_.isResult).map(_.id) should contain("3528302"),
    )
  }

  it should "load live matches" in {

    val comps = testCompetitionsService(
      Competition("101", "/football/championship", "Championship", "Championship", "English", showInTeamsList = true),
    )
    whenReady(comps.refreshMatchDay(fixedClock)) { _ =>
      comps.matches.filter(_.isLive).map(_.id) should be(List()) // well, it's off season now...
    }

  }

  it should "load league tables" in {

    val comps = testCompetitionsService(
      Competition(
        "100",
        "/football/premierleague",
        "Premier League",
        "Premier League",
        "English",
        showInTeamsList = true,
      ),
    )
    comps.competitionAgents.foreach(_.refresh(fixedClock))

    eventually(comps.competitions(0).leagueTable(0).team.id should be("23"))
  }

  it should "not contain matches with known opponents as placeholders" in {
    val date1 = ZonedDateTime.of(2022, 12, 9, 15, 0, 0, 0, ZoneId.of("Europe/London"))
    val date2 = ZonedDateTime.of(2022, 12, 10, 15, 0, 0, 0, ZoneId.of("Europe/London"))
    val placeHolderMatches =
      Seq(fixture("Wnr Gp E/R-Up Gp F", "Wnr Gp G/R-Up Gp H", date1), fixture("Winner Q/F 3", "Winner Q/F 4", date2))

    val comps = testCompetitionsService(
      Competition(
        "700",
        "/football/world-cup-2022",
        "World Cup 2022",
        "World Cup 2022",
        "Internationals",
        showInTeamsList = true,
        tableDividers = List(2),
        matches = placeHolderMatches,
      ),
    )

    val competitionAgent = comps.competitionAgents.head

    assert(competitionAgent.competition.matches.length === 2)
    assert(competitionAgent.competition.matches.contains(placeHolderMatches.head))
    assert(competitionAgent.competition.matches.contains(placeHolderMatches(1)))

    val matchesWithKnownOpponents = Seq(fixture("Brazil", "Croatia", date1), fixture("Spain", "Portugal", date2))
    Await.result(competitionAgent.addMatches(matchesWithKnownOpponents), 2.second)

    assert(competitionAgent.competition.matches.length === 2)
    assert(competitionAgent.competition.matches.contains(matchesWithKnownOpponents.head))
    assert(competitionAgent.competition.matches.contains(matchesWithKnownOpponents(1)))
  }

  it should "still contain placeholder matches with unknown opponents" in {
    val firstGameDate = ZonedDateTime.of(2022, 12, 10, 15, 0, 0, 0, ZoneId.of("Europe/London"))
    val secondGameDate = ZonedDateTime.of(2022, 12, 10, 19, 0, 0, 0, ZoneId.of("Europe/London"))

    val firstPlaceHolderMatch =
      fixture("Winner Group F/Runner-Up Group E", "Winner Group H/Runner-Up Group G", firstGameDate)
    val secondPlaceHolderMatch =
      fixture("Winner Group B/Runner-Up Group A", "Winner Group D/Runner-Up Group C", secondGameDate)
    val matchWithKnownOpponents = fixture("England", "France", secondGameDate)

    val comps = testCompetitionsService(
      Competition(
        "700",
        "/football/world-cup-2022",
        "World Cup 2022",
        "World Cup 2022",
        "Internationals",
        showInTeamsList = true,
        tableDividers = List(2),
        matches = Seq(firstPlaceHolderMatch, secondPlaceHolderMatch),
      ),
    )

    val competitionAgent = comps.competitionAgents.head

    Await.result(competitionAgent.addMatches(Seq(matchWithKnownOpponents)), 2.second)

    assert(competitionAgent.competition.matches.length === 2)
    assert(competitionAgent.competition.matches.contains(firstPlaceHolderMatch))
    assert(competitionAgent.competition.matches.contains(matchWithKnownOpponents))

  }
}
