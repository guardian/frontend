package test

import controllers.SeriesController
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.{BeforeAndAfterAll, DoNotDiscover}
import org.scalatest.matchers.should.Matchers
import play.api.test.Helpers._
import services.SeriesService

@DoNotDiscover class SeriesControllerTest
    extends AnyFlatSpec
    with Matchers
    with ConfiguredTestSuite
    with BeforeAndAfterAll
    with WithMaterializer
    with WithTestWsClient
    with WithTestContentApiClient
    with WithTestApplicationContext {

  var series = "news/series/pass-notes"
  lazy val seriesController =
    new SeriesController(testContentApiClient,
      play.api.test.Helpers.stubControllerComponents(),
      new SeriesService(testContentApiClient),
    )

  "Series Controller" should "200 when content type is a tag" in {
    val result = seriesController.renderSeriesStories(series)(TestRequest())
    status(result) should be(200)
  }

}
