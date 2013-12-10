package test

import org.scalatest.Matchers
import org.scalatest.FlatSpec
import play.api.test._
import play.api.test.Helpers._

class MostPopularControllerTest extends FlatSpec with Matchers {
  
  val tag = "technology"
  val callbackName = "aFunction"

  "Most Popular Controller" should "200 when content type is tag" in Fake {
    val result = controllers.MostPopularController.render(tag)(TestRequest())
    status(result) should be(200)
  }

  it should "return JSONP when callback is supplied" in Fake {
    val fakeRequest = FakeRequest(GET, s"/most-read/${tag}?callback=${callbackName}")
      .withHeaders("host" -> "localhost:9000")

    val result = controllers.MostPopularController.render(tag)(fakeRequest)
    status(result) should be(200)
    contentType(result).get should be("application/javascript")
    contentAsString(result) should startWith(s"""${callbackName}({\"html\"""") // the callback
  }

  it should "return JSON when .json format is supplied" in Fake {
    val fakeRequest = FakeRequest(GET, s"/most-read/${tag}.json")
      .withHeaders("host" -> "localhost:9000")
      .withHeaders("Origin" -> "http://www.theorigin.com")

    val result = controllers.MostPopularController.render(tag)(fakeRequest)
    status(result) should be(200)
    contentType(result).get should be("application/json")
    contentAsString(result) should startWith("{\"html\"")
  }

}