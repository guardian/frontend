package test

import org.scalatest.FlatSpec
import org.scalatest.Matchers
import play.api.test.Helpers._
import play.api.test.FakeRequest
import controllers.{DiscussionApp, DiscussionController}
import discussion.model.DiscussionKey

class CommentPageControllerTest extends FlatSpec with Matchers {

  val callbackName = "foo"

  "Discussion" should "return 200" in Fake {
    val result = DiscussionApp.commentPage(DiscussionKey("p/37v3a"))(TestRequest())
    status(result) should be(200)
  }

  it should "return JSONP when callback is supplied" in Fake {
    val fakeRequest = FakeRequest(GET, "/discussion/p/37v3a.json?callback=" + callbackName).withHeaders("host" -> "localhost:9000")
    val result = DiscussionApp.commentPageJson(DiscussionKey("p/37v3a"))(fakeRequest)

    status(result) should be(200)
    contentType(result).get should be("application/javascript")
    contentAsString(result).substring(0, 200) should startWith(callbackName + "({") // the callback
  }

}
