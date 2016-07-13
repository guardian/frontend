package test

import org.scalatest.{DoNotDiscover, FlatSpec, Matchers}
import play.api.test.Helpers._
import play.api.test.FakeRequest
import controllers.CommentsController
import discussion.model.DiscussionKey
import play.filters.csrf.CSRFConfig

@DoNotDiscover class CommentPageControllerTest extends FlatSpec with Matchers with ConfiguredTestSuite {

  "Discussion" should "return 200" in {
    val commentsController = new CommentsController(CSRFConfig.fromConfiguration(app.configuration))
    val result = commentsController.comments(DiscussionKey("p/37v3a"))(TestRequest())
    status(result) should be(200)
  }
}
