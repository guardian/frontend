package test

import org.scalatest.{DoNotDiscover, Matchers, FlatSpec}
import play.api.test.Helpers._

@DoNotDiscover class SeriesControllerTest extends FlatSpec with Matchers with ConfiguredTestSuite {

  var series = "news/series/pass-notes"

  "Series Controller" should "200 when content type is a tag" in {
    val result = controllers.SeriesController.renderSeriesStories(series)(TestRequest())
    status(result) should be (200)
  }

}
