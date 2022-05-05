package test

import controllers.RichLinkController
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.{BeforeAndAfterAll, DoNotDiscover}
import org.scalatest.matchers.should.Matchers
import play.api.test.Helpers._

@DoNotDiscover class RichLinkControllerTest
    extends AnyFlatSpec
    with Matchers
    with ConfiguredTestSuite
    with BeforeAndAfterAll
    with WithMaterializer
    with WithTestWsClient
    with WithTestApplicationContext
    with WithTestContentApiClient {

  val article = "/world/2014/nov/18/hereford-hospital-patient-tested-for-ebola"
  val badPath = "/goes/absolutely-nowhere"

  lazy val richLinkController =
    new RichLinkController(testContentApiClient, play.api.test.Helpers.stubControllerComponents())

  "RichLinkController" should "200 when the content is found" in {
    val result = richLinkController.render(article)(TestRequest())
    status(result) should be(200)
  }
}
