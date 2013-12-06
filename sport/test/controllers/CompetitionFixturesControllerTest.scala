package test

import play.api.test._
import play.api.test.Helpers._
import org.scalatest.Matchers
import org.scalatest.FlatSpec

class CompetitionFixturesControllerTest extends FlatSpec with Matchers {
  
  val url = "/football/competition/premierleague/fixtures/2012/oct/20"
  val callbackName = "aFunction"
  
  "Competition Fixtures Controller" should "200 when content type is competition fixtures" in Fake {
    val result = football.controllers.CompetitionFixturesController.renderFor("2012", "oct", "20", "premierleague")(TestRequest())
    status(result) should be(200)
  }

  it should "return JSONP when callback is supplied to competition fixtures" in Fake {
    val fakeRequest = FakeRequest(GET, s"${url}?callback=$callbackName")
      .withHeaders("host" -> "localhost:9000")
      
    val result = football.controllers.CompetitionFixturesController.renderFor("2012", "oct", "20", "premierleague")(fakeRequest)
    status(result) should be(200)
    header("Content-Type", result).get should be("application/javascript; charset=utf-8")
    contentAsString(result) should startWith(s"""${callbackName}({\"config\"""")
  }

  it should "return JSON when .json format is supplied to competition fixtures" in Fake {
    val fakeRequest = FakeRequest(GET, s"${url}.json")
      .withHeaders("host" -> "localhost:9000")
      .withHeaders("Origin" -> "http://www.theorigin.com")
        
    val result = football.controllers.CompetitionFixturesController.renderFor("2012", "oct", "20", "premierleague")(fakeRequest)
    status(result) should be(200)
    header("Content-Type", result).get should be("application/json; charset=utf-8")
    contentAsString(result) should startWith("{\"config\"")
  }
  
}