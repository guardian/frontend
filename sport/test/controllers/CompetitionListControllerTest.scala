package test

import football.controllers.CompetitionListController
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers
import play.api.test._
import play.api.test.Helpers._
import org.scalatest.{BeforeAndAfterAll, DoNotDiscover}

@DoNotDiscover class CompetitionListControllerTest
    extends AnyFlatSpec
    with ConfiguredTestSuite
    with Matchers
    with FootballTestData
    with WithTestExecutionContext
    with WithTestFootballClient
    with WithMaterializer
    with WithTestApplicationContext
    with BeforeAndAfterAll
    with WithTestWsClient {

  val url = "/football/competitionsService"
  lazy val competitionListController =
    new CompetitionListController(testCompetitionsService, play.api.test.Helpers.stubControllerComponents())

  "Competition List Controller" should "200 when content type is competition list" in {
    val result = competitionListController.renderCompetitionList()(TestRequest())
    status(result) should be(200)
  }

  it should "return JSON when .json format is supplied" in {
    val fakeRequest = FakeRequest(GET, "${url}.json")
      .withHeaders("host" -> "localhost:9000")
      .withHeaders("Origin" -> "http://www.theorigin.com")

    val result = competitionListController.renderCompetitionListJson()(fakeRequest)
    status(result) should be(200)
    contentType(result) shouldBe Some("application/json")
    contentAsString(result) should startWith("{\"config\"")
  }

}
