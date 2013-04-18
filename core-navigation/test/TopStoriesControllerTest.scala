package test

import play.api.test._
import play.api.test.Helpers._
import org.scalatest.matchers.ShouldMatchers
import org.scalatest.FlatSpec

class TopStoriesControllerTest extends FlatSpec with ShouldMatchers {
  
  val callbackName = "foo"

  "Top Stories" should "should return 200" in Fake {
    val result = controllers.TopStoriesController.render()(TestRequest())
    
    status(result) should be(200)
  }

  it should "return JSONP when callback is supplied" in Fake {
    val fakeRequest = FakeRequest(GET, "/top-stories?callback=" + callbackName).withHeaders("host" -> "localhost:9000")
    val result = controllers.TopStoriesController.render()(fakeRequest)

    status(result) should be(200)
    contentType(result).get should be("application/javascript")
    contentAsString(result) should startWith(callbackName + "({\"html\"") // the callback
  }

  it should "should return 200 for trails" in Fake {
    val result = controllers.TopStoriesController.renderTrails()(TestRequest())
    
    status(result) should be(200)
  }

  it should "return JSONP when callback is supplied to trails" in Fake {
    val fakeRequest = FakeRequest(GET, "/top-stories/trails?callback=" + callbackName).withHeaders("host" -> "localhost:9000")
    val result = controllers.TopStoriesController.renderTrails()(fakeRequest)

    status(result) should be(200)
    contentType(result).get should be("application/javascript")
    contentAsString(result) should startWith(callbackName + "({\"html\"") // the callback
  }
}
