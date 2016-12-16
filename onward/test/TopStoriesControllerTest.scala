package test

import controllers.TopStoriesController
import play.api.test._
import play.api.test.Helpers._
import org.scalatest.{BeforeAndAfterAll, DoNotDiscover, FlatSpec, Matchers}
import play.api.Environment

@DoNotDiscover class TopStoriesControllerTest (implicit env: Environment)
  extends FlatSpec
  with Matchers
  with ConfiguredTestSuite
  with BeforeAndAfterAll
  with WithTestWsClient
  with WithTestContext
  with WithTestContentApiClient {

  lazy val topStoriesController = new TopStoriesController(testContentApiClient)

  "Top Stories" should "should return 200" in {
    val result = topStoriesController.renderTopStories()(TestRequest())
    status(result) should be(200)
  }

  it should "return JSON when .json format is supplied" in {
    val fakeRequest = FakeRequest(GET, s"/top-stories.json")
      .withHeaders("host" -> "localhost:9000")
      .withHeaders("Origin" -> "http://www.theorigin.com")

    val result = topStoriesController.renderTopStories()(fakeRequest)
    status(result) should be(200)
    contentType(result).get should be("application/json")
    contentAsString(result) should startWith("{\"html\"")
  }

  it should "should return 200 for trails" in {
    val result = topStoriesController.renderTrails()(TestRequest())
    status(result) should be(200)
  }
}
