package test

import controllers.RichLinkController
import org.scalatest.{BeforeAndAfterAll, DoNotDiscover, FlatSpec, Matchers}
import play.api.test.Helpers._

@DoNotDiscover class RichLinkControllerTest
  extends FlatSpec
  with Matchers
  with ConfiguredTestSuite
  with BeforeAndAfterAll
  with WithMaterializer
  with WithTestWsClient
  with WithTestContext
  with WithTestContentApiClient {

  val article = "/world/2014/nov/18/hereford-hospital-patient-tested-for-ebola"
  val badPath = "/goes/absolutely-nowhere"

  lazy val richLinkController = new RichLinkController(testContentApiClient)

  "RichLinkController" should "200 when the content is found" in {
      val result = richLinkController.render(article)(TestRequest())
      status(result) should be(200)
  }

  it should "return 404 when content is not found" in {
    val result = richLinkController.render(badPath)(TestRequest())
    status(result) should be(404)
  }

}
