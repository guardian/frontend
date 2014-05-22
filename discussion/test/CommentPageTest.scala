package test

import org.scalatest.FlatSpec
import org.scalatest.Matchers
import play.api.test.Helpers._
import play.api.test.FakeRequest
import controllers.{DiscussionApp, DiscussionController}
import discussion.model.DiscussionKey
import discussion.CommentPage

class CommentPageTest extends FlatSpec with Matchers {

  // Is order ever null in API result?
  // We always get back the sort order.
  // Read the fucking code

  val baseCommentPage = CommentPage("", "", Nil, 0, 0, 0, "", 0, 0, "", false, Nil)

  "CommentPage" should "know its non-javascript url path when sorted by oldest" in {
    val id = "/p/3yk62"
    val order = "oldest"
    val commentPage = baseCommentPage.copy(id = id, orderBy = order)

    commentPage.url should be (s"/discussion/$order$id")
  }

  "CommentPage" should "know its non-javascript url path when sorted by newest" in {
    val id = "/p/7yk42"
    val order = "newest"
    val commentPage = baseCommentPage.copy(id = id, orderBy = order)

    commentPage.url should be (s"/discussion/$order$id")
  }


}
