package test

import play.api.test._
import play.api.test.Helpers._
import org.scalatest.{DoNotDiscover, Matchers, FlatSpec}

@DoNotDiscover class CompetitionListControllerTest extends FlatSpec with Matchers with ConfiguredTestSuite {

  val url = "/football/competitions"

  "Competition List Controller" should "200 when content type is competition list" in {
    val result = football.controllers.CompetitionListController.renderCompetitionList()(TestRequest())
    status(result) should be(200)
  }

  it should "return JSON when .json format is supplied" in {
    val fakeRequest = FakeRequest(GET, "${url}.json")
      .withHeaders("host" -> "localhost:9000")
      .withHeaders("Origin" -> "http://www.theorigin.com")

    val result = football.controllers.CompetitionListController.renderCompetitionListJson()(fakeRequest)
    status(result) should be(200)
    header("Content-Type", result).get should be("application/json; charset=utf-8")
    contentAsString(result) should startWith("{\"config\"")
  }

}
