package test

import controllers.MostViewedVideoController
import feed.MostViewedVideoAgent
import org.scalatest.{BeforeAndAfterAll, DoNotDiscover, FlatSpec, Matchers}
import play.api.test.Helpers._
import services.OphanApi

@DoNotDiscover class MostViewedVideoTest
    extends FlatSpec
    with Matchers
    with ConfiguredTestSuite
    with BeforeAndAfterAll
    with WithMaterializer
    with WithTestWsClient
    with WithTestContentApiClient {

  lazy val mostViewedVideoController = new MostViewedVideoController(
    testContentApiClient,
    new MostViewedVideoAgent(testContentApiClient, new OphanApi(wsClient)),
    play.api.test.Helpers.stubControllerComponents(),
  )

  "Most Viewed Video Controller" should "200 when content type is tag" in {
    val result = mostViewedVideoController.renderMostViewed()(TestRequest())
    status(result) should be(200)
  }
}
