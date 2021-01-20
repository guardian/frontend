package test

import feed.CompetitionsService
import model.Competition
import org.scalatest.{BeforeAndAfterAll, DoNotDiscover, FlatSpec, Matchers}
import org.scalatest.concurrent.{ScalaFutures, Eventually}
import org.scalatest.time.{Millis, Span}
import org.joda.time.{DateTime, DateTimeUtils, LocalDate}

@DoNotDiscover class CompetitionAgentTest
    extends FlatSpec
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

  override def beforeAll(): Unit = {
    // Tests in this suite are time dependent:
    // => Force date to the day the test files have been generated (Note: time doesn't matter)
    val fixedDate = new DateTime(2016, 6, 22, 15, 0).getMillis
    DateTimeUtils.setCurrentMillisFixed(fixedDate)
  }

  override def afterAll(): Unit = {
    DateTimeUtils.setCurrentMillisSystem()
    super.afterAll()
  }

  override implicit val patienceConfig =
    PatienceConfig(timeout = scaled(Span(3000, Millis)), interval = scaled(Span(100, Millis)))

  lazy val seasonStart = Some(new LocalDate(2012, 8, 1))

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
    comps.competitionAgents.foreach(_.refreshResults())

    eventually(
      comps.matches.filter(_.isResult).map(_.id) should contain("3528302"),
    )
  }

  it should "load live matches" in {

    val comps = testCompetitionsService(
      Competition("101", "/football/championship", "Championship", "Championship", "English", showInTeamsList = true),
    )
    whenReady(comps.refreshMatchDay()) { _ =>
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
    comps.competitionAgents.foreach(_.refresh)

    eventually(comps.competitions(0).leagueTable(0).team.id should be("23"))
  }

}
