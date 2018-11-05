package test

import controllers.ImageContentController
import play.api.test.Helpers._
import org.scalatest.{BeforeAndAfterAll, DoNotDiscover, FlatSpec, Matchers}

@DoNotDiscover class ImageContentControllerTest
  extends FlatSpec
  with Matchers
  with ConfiguredTestSuite
  with BeforeAndAfterAll
  with WithMaterializer
  with WithTestWsClient
  with WithTestApplicationContext
  with WithTestContentApiClient {

  val cartoonUrl = "commentisfree/cartoon/2013/jul/15/iain-duncan-smith-benefits-cap"
  val pictureUrl = "artanddesign/picture/2013/oct/08/photography"

  lazy val imageContentController = new ImageContentController(testContentApiClient, play.api.test.Helpers.stubControllerComponents(), wsClient)

  "Image Content Controller" should "200 when content type is picture" in {
    val result = imageContentController.render(pictureUrl)(TestRequest(pictureUrl))
    status(result) should be(200)
  }

  "Image Content Controller" should "200 when content type is cartoon" in {
    val result = imageContentController.render(cartoonUrl)(TestRequest(cartoonUrl))
    status(result) should be(200)
  }

}
