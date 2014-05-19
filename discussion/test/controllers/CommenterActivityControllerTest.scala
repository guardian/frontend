package controllers

import org.scalatest.FlatSpec
import org.scalatest.Matchers
import play.api.test.Helpers._
import play.api.test.FakeRequest
import test.`package`._
import test.TestRequest

class CommenterActivityControllerTest extends FlatSpec with Matchers {

  val callbackName = "foo"
  val userId = "10000001"

  "CommenterActivity" should "work for simple request" in Fake{
    val action = DiscussionApp.commenterActivity(userId)
    val result = action(TestRequest())
    status(result) should be(200)
    contentType(result).get should be("text/html")
  }

  it should "return JSONP when callback is supplied" in Fake {
    val action = DiscussionApp.commenterActivity(userId)
    val fakeRequest = FakeRequest(GET, "/discussion/p/37v3a.json?callback=" + callbackName).withHeaders("host" -> "localhost:9000")
    val result = action(fakeRequest)

    status(result) should be(200)
    contentType(result).get should be("application/javascript")
    contentAsString(result).substring(0, 10) should startWith(callbackName + "({") // the callback
  }

}
