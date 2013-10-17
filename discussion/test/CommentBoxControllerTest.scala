package test

import concurrent.Future

import discussion.model.{PrivateProfileFields, Profile}
import discussion.DiscussionApi
import discussion.DiscussionHeaders._
import controllers.CommentBoxController

import org.scalatest.FlatSpec
import org.scalatest.matchers.ShouldMatchers
import play.api.mvc.Headers
import play.api.test.FakeRequest
import play.api.test.Helpers._
import play.api.libs.ws.Response

class CommentBoxControllerTest extends FlatSpec with ShouldMatchers {

  "CommentBoxController" should "render normal comment box for user who can comment (by Cookie)" in{
    val fakeRequest = FakeRequest(GET, "/discussion/comment-box.json").withHeaders(cookie -> "Tom")
    val result = controller.commentBox()(fakeRequest)
    status(result) should be(200)
    contentType(result) should be(Some("application/json"))
    contentAsString(result) should include("Add your comment")
    contentAsString(result) should not include("Your comments are currently being pre-moderated")
  }

  it should "render normal comment box for user who can comment (by ID Token)" in{
    val fakeRequest = FakeRequest(GET, "/discussion/comment-box.json").withHeaders(guIdToken -> "Tom")
    val result = controller.commentBox()(fakeRequest)
    status(result) should be(200)
    contentType(result) should be(Some("application/json"))
    contentAsString(result) should include("Add your comment")
    contentAsString(result) should not include("Your comments are currently being pre-moderated")
  }

  it should "render premod comment box for premoderated user who can comment (by Cookie)" in{
    val fakeRequest = FakeRequest(GET, "/discussion/comment-box.json").withHeaders(cookie -> "Pam")
    val result = controller.commentBox()(fakeRequest)
    status(result) should be(200)
    contentType(result) should be(Some("application/json"))
    contentAsString(result) should include("Add your comment")
    contentAsString(result) should include("Your comments are currently being pre-moderated")
  }

  it should "render premod comment box for premoderated user who can comment (by ID Token)" in{
    val fakeRequest = FakeRequest(GET, "/discussion/comment-box.json").withHeaders(guIdToken -> "Pam")
    val result = controller.commentBox()(fakeRequest)
    status(result) should be(200)
    contentType(result) should be(Some("application/json"))
    contentAsString(result) should include("Add your comment")
    contentAsString(result) should include("Your comments are currently being pre-moderated")
  }

  it should "not render comment box for banned user (by Cookie)" in{
    val fakeRequest = FakeRequest(GET, "/discussion/comment-box.json").withHeaders(cookie -> "Ben")
    val result = controller.commentBox()(fakeRequest)
    status(result) should be(200)
    contentType(result) should be(Some("application/json"))
    contentAsString(result) should not include("Add your comment")
    contentAsString(result) should include("Commenting has been disabled for this account")
  }

  it should "not render comment box for banned user (by ID Token)" in{
    val fakeRequest = FakeRequest(GET, "/discussion/comment-box.json").withHeaders(guIdToken -> "Ben")
    val result = controller.commentBox()(fakeRequest)
    status(result) should be(200)
    contentType(result) should be(Some("application/json"))
    contentAsString(result) should not include("Add your comment")
    contentAsString(result) should include("Commenting has been disabled for this account")
  }

  it should "not render comment box for banned premoderated user (by Cookie)" in{
    val fakeRequest = FakeRequest(GET, "/discussion/comment-box.json").withHeaders(cookie -> "Norman")
    val result = controller.commentBox()(fakeRequest)
    status(result) should be(200)
    contentType(result) should be(Some("application/json"))
    contentAsString(result) should not include("Add your comment")
    contentAsString(result) should include("Commenting has been disabled for this account")
  }

  it should "not render comment box for banned premoderated user (by ID Token)" in{
    val fakeRequest = FakeRequest(GET, "/discussion/comment-box.json").withHeaders(guIdToken -> "Norman")
    val result = controller.commentBox()(fakeRequest)
    status(result) should be(200)
    contentType(result) should be(Some("application/json"))
    contentAsString(result) should not include("Add your comment")
    contentAsString(result) should include("Commenting has been disabled for this account")
  }

  it should "not render comment box for invalid user" in{
    val fakeRequest = FakeRequest(GET, "/discussion/comment-box.json").withHeaders(guIdToken -> "Foo")
    val result = controller.commentBox()(fakeRequest)
    status(result) should be(200)
    contentType(result) should be(Some("application/json"))
    contentAsString(result) should not include("Add your comment")
    contentAsString(result) should include("Error loading profile")
  }

  val controller = new CommentBoxController{
    protected val discussionApi = FakeApi
  }

  val bannedBob = profile("Banned Bob", canPost = false, isPremod = false)
  val premodPam = profile("Premod Pam", canPost = true, isPremod = true)
  val nowayNorman = profile("Banned Premod Norman", canPost = false, isPremod = true)
  val typicalTom = profile("Typical Tom", canPost = true, isPremod = false)

  def profile(name: String, canPost: Boolean, isPremod: Boolean): Profile = {
    Profile(name, "", name, privateFields = Some(PrivateProfileFields(canPost, isPremod, isSocial = false)))
  }

  object FakeApi extends DiscussionApi {
    protected def GET(url: String, headers: (String, String)*): Future[Response] = null
    protected val apiRoot: String = ""

    override def myProfile(headers: Headers): Future[Profile] = Future {
      val header = headers get cookie orElse {headers get guIdToken} getOrElse {throw new RuntimeException }
      header match {
        case "Ben" => bannedBob
        case "Pam" => premodPam
        case "Norman" => nowayNorman
        case "Tom" => typicalTom
        case _ => throw new RuntimeException("Error loading profile")
      }
    }
  }
}
