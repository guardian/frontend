package test

import play.api.test._
import play.api.test.Helpers._
import org.scalatest.matchers.ShouldMatchers
import org.scalatest.FlatSpec

class FrontControllerTest extends FlatSpec with ShouldMatchers {
  
  val articleUrl = "/environment/2012/feb/22/capitalise-low-carbon-future"

  "Front Controller" should "200 when content type is front" in Fake {
    val result = controllers.FrontController.render("front")(TestRequest())
    status(result) should be(200)
  }

  it should "return JSONP when callback is supplied to front" in Fake {
    val fakeRequest = FakeRequest(GET, "?callback=foo").withHeaders("host" -> "localhost:9000")
    val result = controllers.FrontController.render("front")(fakeRequest)
    status(result) should be(200)
    header("Content-Type", result).get should be("application/javascript")
  }

  it should "200 when content type is front trails" in Fake {
    val result = controllers.FrontController.renderTrails("front")(TestRequest())
    status(result) should be(200)
  }

  it should "return JSONP when callback is supplied to front trails" in Fake {
    val fakeRequest = FakeRequest(GET, "/culture/trails?callback=foo").withHeaders("host" -> "localhost:9000")
    val result = controllers.FrontController.renderTrails("front")(fakeRequest)
    status(result) should be(200)
    header("Content-Type", result).get should be("application/javascript")
  }

}