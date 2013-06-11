package test

import play.api.test._
import play.api.test.Helpers._
import org.scalatest.matchers.ShouldMatchers
import org.scalatest.FlatSpec

class LiveMatchesControllerTest extends FlatSpec with ShouldMatchers {
  
  "Live Matches Controller" should "200 when content type is live match" in Fake {
    val result = controllers.LiveMatchesController.render()(TestRequest())
    status(result) should be(200)
  }

  it should "return JSONP when callback is supplied to live match" in Fake {
    val fakeRequest = FakeRequest(GET, "/football/live?callback=foo")
      .withHeaders("host" -> "localhost:9000")
      .withHeaders("Accept" -> "application/javascript")
    val result = controllers.LiveMatchesController.render()(fakeRequest)
    status(result) should be(200)
    header("Content-Type", result).get should be("application/javascript")
  }

  it should "return JSON when .json format is supplied to live match" in Fake {
    val fakeRequest = FakeRequest(GET, "/football/live.json")
      .withHeaders("host" -> "localhost:9000")
      .withHeaders("Origin" -> "http://www.theorigin.com")
      
    val result = controllers.LiveMatchesController.render()(fakeRequest)
    status(result) should be(200)
    header("Content-Type", result).get should be("application/json")
    contentAsString(result) should startWith("{\"config\"")
  }
  
  val competitionId = "premierleague"
  
  it should "200 when content type is competition live match" in Fake {
    val result = controllers.LiveMatchesController.renderFor(competitionId)(TestRequest())
    status(result) should be(200)
  }

  it should "return JSONP when callback is supplied to competition live match" in Fake {
    val fakeRequest = FakeRequest(GET, "/football/" + competitionId + "/live?callback=foo")
      .withHeaders("host" -> "localhost:9000")
      .withHeaders("Accept" -> "application/javascript")
    val result = controllers.LiveMatchesController.renderFor(competitionId)(fakeRequest)
    status(result) should be(200)
    header("Content-Type", result).get should be("application/javascript")
  }

  it should "return JSON .json format is supplied to competition live match" in Fake {
    val fakeRequest = FakeRequest(GET, "/football/" + competitionId + "/live.json")
      .withHeaders("host" -> "localhost:9000")
      .withHeaders("Origin" -> "http://www.theorigin.com")
      
    val result = controllers.LiveMatchesController.renderFor(competitionId)(fakeRequest)
    status(result) should be(200)
    header("Content-Type", result).get should be("application/json")
    contentAsString(result) should startWith("{\"config\"")
  }
  
}