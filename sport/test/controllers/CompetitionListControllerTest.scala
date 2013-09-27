package test

import play.api.test._
import play.api.test.Helpers._
import org.scalatest.matchers.ShouldMatchers
import org.scalatest.FlatSpec

class CompetitionListControllerTest extends FlatSpec with ShouldMatchers {
  
  val url = "/football/competitions"
  val callbackName = "aFunction"
  
  "Competition List Controller" should "200 when content type is competition list" in Fake {
    val result = controllers.CompetitionListController.renderCompetitionList()(TestRequest())
    status(result) should be(200)
  }

  it should "return JSONP when callback is supplied" in Fake {
    val fakeRequest = FakeRequest(GET, s"${url}?callback=$callbackName")
      .withHeaders("host" -> "localhost:9000")
      .withHeaders("Accept" -> "application/javascript")
      
    val result = controllers.CompetitionListController.renderCompetitionList()(fakeRequest)
    status(result) should be(200)
    header("Content-Type", result).get should be("application/javascript")
    contentAsString(result) should startWith(s"""${callbackName}({\"config\"""")
  }

  it should "return JSON when .json format is supplied" in Fake {
    val fakeRequest = FakeRequest(GET, "${url}.json")
      .withHeaders("host" -> "localhost:9000")
      .withHeaders("Origin" -> "http://www.theorigin.com")
      
    val result = controllers.CompetitionListController.renderCompetitionListJson()(fakeRequest)
    status(result) should be(200)
    header("Content-Type", result).get should be("application/json")
    contentAsString(result) should startWith("{\"config\"")
  }
  
}