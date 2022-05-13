package test

import feed.CompetitionsService
import model.Competition
import org.scalatest.{BeforeAndAfterAll, DoNotDiscover}
import org.scalatest.concurrent.{Eventually, ScalaFutures}
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers
import org.scalatest.time.{Millis, Span}

import java.time.{Clock, LocalDate, ZonedDateTime}
import java.time.ZoneId

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

}
