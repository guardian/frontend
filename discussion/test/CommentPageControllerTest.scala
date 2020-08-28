package test

import org.scalatest.{BeforeAndAfterAll, DoNotDiscover, FlatSpec, Matchers}
import play.api.test.Helpers._
import controllers.CommentsController
import discussion.model.DiscussionKey

@DoNotDiscover class CommentPageControllerTest
    extends FlatSpec
    with Matchers
    with ConfiguredTestSuite
    with BeforeAndAfterAll
    with WithMaterializer
    with WithTestApplicationContext
    with WithTestCSRF
    with WithTestWsClient {

  "Discussion" should "return 200" in {
    val commentsController = new CommentsController(
      new DiscussionApiStub(wsClient),
      csrfCheck,
      csrfAddToken,
      play.api.test.Helpers.stubControllerComponents(),
    )
    val result = commentsController.comments(DiscussionKey("p/37v3a"))(TestRequest())
    status(result) should be(200)
  }
}
