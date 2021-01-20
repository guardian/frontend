package controllers

import org.scalatest.{BeforeAndAfterAll, DoNotDiscover, FlatSpec, Matchers}
import play.api.test.Helpers._
import play.api.test.FakeRequest
import test.{ConfiguredTestSuite, DiscussionApiStub, WithMaterializer, WithTestWsClient}

@DoNotDiscover class ProfileActivityControllerTest
    extends FlatSpec
    with Matchers
    with ConfiguredTestSuite
    with BeforeAndAfterAll
    with WithMaterializer
    with WithTestWsClient {

  val userId = "10000001"

  "CommenterActivity" should "return profile discussions component" in {
    val action =
      new ProfileActivityController(new DiscussionApiStub(wsClient), play.api.test.Helpers.stubControllerComponents())
        .profileDiscussions(userId)
    val fakeRequest =
      FakeRequest(GET, "/discussion/profile/" + userId + "/discussions.json").withHeaders("host" -> "localhost:9000")
    val result = action(fakeRequest)

    status(result) should be(200)
    contentType(result).get should be("application/json")
    contentAsString(result) should include("class=\\\"activity-stream activity-stream--discussions\\\"")
  }

}
