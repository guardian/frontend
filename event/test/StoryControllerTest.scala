package test

import play.api.test._
import play.api.test.Helpers._
import org.scalatest.matchers.ShouldMatchers
import org.scalatest.FlatSpec

class StoryControllerTest extends FlatSpec with ShouldMatchers {
  
  val callbackName = "stories"

  "Story Controller" should "200 when content type is latest" in Fake {
    val result = controllers.StoryController.latest()(TestRequest())
    
    status(result) should be(200)
  }

  it should "return JSONP when callback is supplied to latest" in Fake {
    val fakeRequest = FakeRequest(GET, "/stories?callback=" + callbackName).withHeaders("host" -> "localhost:9000")
    val result = controllers.StoryController.latest()(fakeRequest)
    
    status(result) should be(200)
    contentType(result).get should be("application/javascript")
    contentAsString(result) should startWith(callbackName + "({\"config\"") // the callback
  }

  "Story Controller" should "200 when content type is byId" in Fake {
    val result = controllers.StoryController.byId("680026")(TestRequest())
    
    status(result) should be(200)
  }

  it should "return JSONP when callback is supplied to byId" in Fake {
    val fakeRequest = FakeRequest(GET, "/stories/680026?callback=" + callbackName).withHeaders("host" -> "localhost:9000")
    val result = controllers.StoryController.byId("680026")(fakeRequest)
    
    status(result) should be(200)
    contentType(result).get should be("application/javascript")
    contentAsString(result) should startWith(callbackName + "({\"config\"") // the callback
  }

}