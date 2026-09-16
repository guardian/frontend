package test

import controllers.ImageContentController
import model.ApplicationIdentity
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers
import org.scalatest.{BeforeAndAfterAll, DoNotDiscover}
import play.api.test.Helpers._
import services.SubnavAgent

@DoNotDiscover class ImageContentControllerTest
    extends AnyFlatSpec
    with Matchers
    with ConfiguredTestSuite
    with BeforeAndAfterAll
    with WithMaterializer
    with WithTestWsClient
    with WithTestApplicationContext
    with WithTestContentApiClient {

  val cartoonUrl = "commentisfree/cartoon/2013/jul/15/iain-duncan-smith-benefits-cap"
  val pictureUrl = "artanddesign/picture/2013/oct/08/photography"

  lazy val imageContentController =
    new ImageContentController(
      contentApiClient = testContentApiClient,
      controllerComponents = play.api.test.Helpers.stubControllerComponents(),
      wsClient = wsClient,
      subnavAgent = new SubnavAgent(ApplicationIdentity("mock")),
    )

  "Image Content Controller" should "200 when content type is picture" in {
    val result = imageContentController.render(pictureUrl)(TestRequest(s"$pictureUrl?dcr=false"))
    status(result) should be(200)
  }

  "Image Content Controller" should "200 when content type is cartoon" in {
    val result = imageContentController.render(cartoonUrl)(TestRequest(s"$cartoonUrl?dcr=false"))
    status(result) should be(200)
  }

}
