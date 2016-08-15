package test

import football.controllers.CompetitionListController
import play.api.test._
import play.api.test.Helpers._
import org.scalatest.{DoNotDiscover, FlatSpec, Matchers}

@DoNotDiscover class CompetitionListControllerTest
  extends FlatSpec
  with Matchers
  with FootballTestData {

  val url = "/football/competitionsService"
  lazy val competitionListController = new CompetitionListController(testCompetitionsService)

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
    header("Content-Type", result).get should be("application/json; charset=utf-8")
    contentAsString(result) should startWith("{\"config\"")
  }

}
