package test

import org.scalatest.matchers.ShouldMatchers
import org.scalatest.FlatSpec
import play.api.test._
import play.api.test.Helpers._

class MostPopularControllerTest extends FlatSpec with ShouldMatchers {
  
  val tag = "technology"
  val callbackName = "foo"

  "Most Popular Controller" should "200 when content type is tag" in Fake {
    val result = controllers.MostPopularController.render(tag)(TestRequest())
    status(result) should be(200)
  }

  it should "return JSONP when callback is supplied" in Fake {
    val fakeRequest = FakeRequest(GET, tag + "?callback=" + callbackName).withHeaders("host" -> "localhost:9000")
    val result = controllers.MostPopularController.render(tag)(fakeRequest)
    
    status(result) should be(200)
    contentType(result).get should be("application/javascript")
    contentAsString(result) should startWith(callbackName + "({\"html\"") // the callback
  }
}