package test

import org.scalatest.{DoNotDiscover, FlatSpec, Matchers}
import play.api.test.Helpers._
import controllers.CommentCountController
import discussion.DiscussionApiLike

@DoNotDiscover class CommentCountControllerTest extends FlatSpec with Matchers with ConfiguredTestSuite {

  "Discussion" should "return 200" in {
    val result = CommentCountController(new DiscussionApiStub(wsClient)).commentCount("p/37v3a")(TestRequest())
    status(result) should be(200)
  }
}
