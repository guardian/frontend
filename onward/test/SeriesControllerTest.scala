package test

import org.scalatest.{DoNotDiscover, Matchers, FlatSpec}
import play.api.test.FakeRequest
import play.api.test.Helpers._

@DoNotDiscover class SeriesControllerTest extends FlatSpec with Matchers with ConfiguredTestSuite {

  var series = "theguardian/series/pass-notes"

  "Series Controller" should "200 when content type is a tag" in {
    val result = controllers.SeriesController.renderSeriesStories(series)(TestRequest())
    status(result) should be (200)
  }


  it should "return JSON when " in {

    val fakeRequest = FakeRequest(GET, s"/most-read/${series}.json")
      .withHeaders("host" -> "localhost:9000")
      .withHeaders("Origin" -> "http://www.theorigin.com")

    val result = controllers.MostPopularController.render(series)(fakeRequest)
    status(result) should be(200)
    contentType(result).get should be("application/json")
    contentAsString(result) should startWith("{\"html\"")
  }

}
