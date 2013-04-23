package test

import play.api.test._
import play.api.test.Helpers._
import org.scalatest.matchers.ShouldMatchers
import org.scalatest.FlatSpec

class ResultsControllerTest extends FlatSpec with ShouldMatchers {
  
  "Results Controller" should "200 when content type is results" in Fake {
    val result = controllers.ResultsController.render()(TestRequest())
    status(result) should be(200)
  }

  it should "return JSONP when callback is supplied to results" in Fake {
    val fakeRequest = FakeRequest(GET, "/football/results?callback=foo").withHeaders("host" -> "localhost:9000")
    val result = controllers.ResultsController.render()(fakeRequest)
    status(result) should be(200)
    header("Content-Type", result).get should be("application/javascript")
  }
  
  val tag = "premierleague"
  
  it should "200 when content type is tag results" in Fake {
    val result = controllers.ResultsController.renderTag(tag)(TestRequest())
    status(result) should be(200)
  }

  it should "return JSONP when callback is supplied to tag results" in Fake {
    val fakeRequest = FakeRequest(GET, "/football/" + tag + "/results?callback=foo").withHeaders("host" -> "localhost:9000")
    val result = controllers.ResultsController.renderTag(tag)(fakeRequest)
    status(result) should be(200)
    header("Content-Type", result).get should be("application/javascript")
  }
  
  it should "200 when content type is for results" in Fake {
    val result = controllers.ResultsController.renderFor("2012", "oct", "20")(TestRequest())
    status(result) should be(200)
  }

  it should "return JSONP when callback is supplied to for results" in Fake {
    val fakeRequest = FakeRequest(GET, "/football/results/2012/oct/20?callback=foo").withHeaders("host" -> "localhost:9000")
    val result = controllers.ResultsController.renderFor("2012", "oct", "20")(fakeRequest)
    status(result) should be(200)
    header("Content-Type", result).get should be("application/javascript")
  }
  
}