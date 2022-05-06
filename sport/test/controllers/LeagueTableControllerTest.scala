package test

import football.controllers.LeagueTableController
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers
import play.api.test._
import play.api.test.Helpers._
import org.scalatest.{BeforeAndAfterAll, DoNotDiscover}

@DoNotDiscover class LeagueTableControllerTest
    extends AnyFlatSpec
    with ConfiguredTestSuite
    with Matchers
    with FootballTestData
    with WithTestFootballClient
    with WithMaterializer
    with BeforeAndAfterAll
    with WithTestApplicationContext
    with WithTestExecutionContext
    with WithTestWsClient {

  lazy val leagueTableController =
    new LeagueTableController(testCompetitionsService, play.api.test.Helpers.stubControllerComponents())

  "League Table Controller" should "200 when content type is table" in {
    val result = leagueTableController.renderLeagueTables()(TestRequest())
    status(result) should be(200)
  }

  it should "return JSON when .json format is supplied to table" in {
    val fakeRequest = FakeRequest(GET, "/football/tables.json")
      .withHeaders("host" -> "localhost:9000")
      .withHeaders("Origin" -> "http://www.theorigin.com")

    val result = leagueTableController.renderLeagueTablesJson()(fakeRequest)
    status(result) should be(200)
    contentType(result) shouldBe Some("application/json")
    contentAsString(result) should startWith("{\"config\"")
  }

  it should "200 when content type is teams" in {
    val result = leagueTableController.renderTeamlist()(TestRequest().withHeaders("Accept" -> "application/javascript"))
    status(result) should be(200)
  }

  it should "return JSON when .json format is supplied to teams" in {
    val fakeRequest = FakeRequest(GET, "/football/teams.json")
      .withHeaders("host" -> "localhost:9000")
      .withHeaders("Origin" -> "http://www.theorigin.com")

    val result = leagueTableController.renderTeamlist()(fakeRequest)
    status(result) should be(200)
    contentType(result) shouldBe Some("application/json")
    contentAsString(result) should startWith("{\"config\"")
  }

  val competitionId = "premierleague"

  it should "200 when content type is competition table" in {
    val result = leagueTableController.renderCompetition(competitionId)(TestRequest())
    status(result) should be(200)
  }

  it should "return JSON when .json format is supplied to competition table" in {
    val fakeRequest = FakeRequest(GET, "/football/" + competitionId + "/table.json")
      .withHeaders("host" -> "localhost:9000")
      .withHeaders("Origin" -> "http://www.theorigin.com")

    val result = leagueTableController.renderCompetition(competitionId)(fakeRequest)
    status(result) should be(200)
    contentType(result) shouldBe Some("application/json")
    contentAsString(result) should startWith("{\"html\"")
  }

}
