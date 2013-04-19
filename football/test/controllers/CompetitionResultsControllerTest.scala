package test

import play.api.test._
import play.api.test.Helpers._
import org.scalatest.matchers.ShouldMatchers
import org.scalatest.FlatSpec

class CompetitionResultsControllerTest extends FlatSpec with ShouldMatchers {
  
  "Competition Results Controller" should "200 when content type is competition results" in Fake {
    val result = controllers.CompetitionResultsController.renderFor("2012", "oct", "20", "premierleague")(TestRequest())
    status(result) should be(200)
  }

  it should "return JSONP when callback is supplied to competition results" in Fake {
    val fakeRequest = FakeRequest(GET, "/football/competition/premierleague/results/2012/oct/20?callback=foo").withHeaders("host" -> "localhost:9000")
    val result = controllers.CompetitionResultsController.renderFor("2012", "oct", "20", "premierleague")(fakeRequest)
    status(result) should be(200)
    header("Content-Type", result).get should be("application/javascript")
  }
  
}