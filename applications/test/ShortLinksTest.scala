package test

import controllers.ShortUrlsController
import org.scalatest.{BeforeAndAfterAll, DoNotDiscover, FlatSpec, Matchers}
import play.api.test.Helpers._

@DoNotDiscover class ShortUrlsControllerTest
  extends FlatSpec
    with Matchers
    with BeforeAndAfterAll
    with ConfiguredTestSuite
    with WithMaterializer
    with WithTestWsClient
    with WithTestApplicationContext
    with WithTestContentApiClient {

  lazy val shortUrlsController = new ShortUrlsController(
    testContentApiClient,
    play.api.test.Helpers.stubControllerComponents()
  )

  it should "correctly redirect short urls to other servers" in {
    val result = shortUrlsController.redirectShortUrl("p/3jdag")(TestRequest("/p/3jdag"))
    status(result) should be(301)
    header("Location", result).get should be("/music/2013/oct/11/david-byrne-internet-content-world")
  }
}
