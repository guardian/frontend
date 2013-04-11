package test

import play.api.test._
import play.api.test.Helpers._
import org.scalatest.matchers.ShouldMatchers
import org.scalatest.FlatSpec

class MatchControllerTest extends FlatSpec with ShouldMatchers {
  
  val matchId = "3518296"
  
  "Match Controller" should "200 when content type is match" in Fake {
    val result = controllers.MatchController.renderMatchId(matchId)(TestRequest())
    status(result) should be(200)
  }

  it should "return JSONP when callback is supplied to match" in Fake {
    val fakeRequest = FakeRequest(GET, "/football/match/" + matchId + "?callback=foo").withHeaders("host" -> "localhost:9000")
    val result = controllers.MatchController.renderMatchId(matchId)(fakeRequest)
    status(result) should be(200)
    header("Content-Type", result).get should be("application/javascript")
  }
  
}