package test

import play.api.test._
import play.api.test.Helpers._
import org.scalatest.matchers.ShouldMatchers
import org.scalatest.FlatSpec

class FixturesControllerTest extends FlatSpec with ShouldMatchers {
  
  "Fixtures Controller" should "200 when content type is fixtures" in Fake {
    val result = controllers.FixturesController.render()(TestRequest())
    status(result) should be(200)
  }

  it should "return JSONP when callback is supplied to fixtures" in Fake {
    val fakeRequest = FakeRequest(GET, "/football/fixtures?callback=foo").withHeaders("host" -> "localhost:9000")
    val result = controllers.FixturesController.render()(fakeRequest)
    status(result) should be(200)
    header("Content-Type", result).get should be("application/javascript")
  }
  
  val tag = "premierleague"
  
  it should "200 when content type is tag fixtures" in Fake {
    val result = controllers.FixturesController.renderTag(tag)(TestRequest())
    status(result) should be(200)
  }

  it should "return JSONP when callback is supplied to tag fixtures" in Fake {
    val fakeRequest = FakeRequest(GET, "/football/" + tag + "/fixtures?callback=foo").withHeaders("host" -> "localhost:9000")
    val result = controllers.FixturesController.renderTag(tag)(fakeRequest)
    status(result) should be(200)
    header("Content-Type", result).get should be("application/javascript")
  }
  
  it should "200 when content type is for fixtures" in Fake {
    val result = controllers.FixturesController.renderFor("2012", "oct", "20")(TestRequest())
    status(result) should be(200)
  }

  it should "return JSONP when callback is supplied to for fixtures" in Fake {
    val fakeRequest = FakeRequest(GET, "/football/fixtures/2012/oct/20?callback=foo").withHeaders("host" -> "localhost:9000")
    val result = controllers.FixturesController.renderFor("2012", "oct", "20")(fakeRequest)
    status(result) should be(200)
    header("Content-Type", result).get should be("application/javascript")
  }
  
}