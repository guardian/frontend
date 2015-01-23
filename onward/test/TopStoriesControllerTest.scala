package test

import play.api.test._
import play.api.test.Helpers._
import org.scalatest.{DoNotDiscover, Matchers, FlatSpec}

@DoNotDiscover class TopStoriesControllerTest extends FlatSpec with Matchers with ConfiguredTestSuite {

  "Top Stories" should "should return 200" in {
    val result = controllers.TopStoriesController.renderTopStories()(TestRequest())
    status(result) should be(200)
  }

  it should "return JSON when .json format is supplied" in {
    val fakeRequest = FakeRequest(GET, s"/top-stories.json")
      .withHeaders("host" -> "localhost:9000")
      .withHeaders("Origin" -> "http://www.theorigin.com")

    val result = controllers.TopStoriesController.renderTopStories()(fakeRequest)
    status(result) should be(200)
    contentType(result).get should be("application/json")
    contentAsString(result) should startWith("{\"html\"")
  }

  it should "should return 200 for trails" in {
    val result = controllers.TopStoriesController.renderTrails()(TestRequest())
    status(result) should be(200)
  }
}
