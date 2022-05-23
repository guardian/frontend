package test

import controllers.TopStoriesController
import org.scalatest.flatspec.AnyFlatSpec
import play.api.test._
import play.api.test.Helpers._
import org.scalatest.{BeforeAndAfterAll, DoNotDiscover}
import org.scalatest.matchers.should.Matchers

@DoNotDiscover class TopStoriesControllerTest
    extends AnyFlatSpec
    with Matchers
    with ConfiguredTestSuite
    with BeforeAndAfterAll
    with WithMaterializer
    with WithTestWsClient
    with WithTestApplicationContext
    with WithTestContentApiClient {

  lazy val topStoriesController =
    new TopStoriesController(testContentApiClient, play.api.test.Helpers.stubControllerComponents())

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
