package controllers

import org.scalatest.FlatSpec
import org.scalatest.Matchers
import play.api.test.Helpers._
import play.api.test.FakeRequest
import test.`package`._
import test.TestRequest

class ProfileActivityControllerTest extends FlatSpec with Matchers {

  val userId = "10000001"

  "CommenterActivity" should "return profile discussions component" in Fake {
    val action = DiscussionApp.profileDiscussions(userId)
    val fakeRequest = FakeRequest(GET, "/discussion/profile/"+ userId +"/discussions.json").withHeaders("host" -> "localhost:9000")
    val result = action(fakeRequest)

    status(result) should be(200)
    contentType(result).get should be("application/json")
    contentAsString(result) should include("class=\\\"activity-stream activity-stream--discussions\\\"")
  }

}
