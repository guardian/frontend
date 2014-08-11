package test

import org.scalatest.FlatSpec
import org.scalatest.Matchers
import play.api.test.Helpers._
import play.api.test.FakeRequest
import controllers.DiscussionApp

class CommentCountControllerTest extends FlatSpec with Matchers {

  val callbackName = "foo"

  "Discussion" should "return 200" in FakeDiscussion {
    val result = DiscussionApp.commentCount("p/37v3a")(TestRequest())
    status(result) should be(200)
  }

  it should "return JSONP when callback is supplied" in FakeDiscussion {
    val fakeRequest = FakeRequest(GET, "/discussion/comment-counts.json?shortUrls=/p/37v3a&callback=" + callbackName).withHeaders("host" -> "localhost:9000")
    val result = DiscussionApp.commentCount("p/37v3a")(fakeRequest)

    status(result) should be(200)
    contentType(result).get should be("application/javascript")
    contentAsString(result) should startWith(callbackName + "({\"counts\"") // the callback
  }

}
