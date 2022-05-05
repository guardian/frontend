package test
import controllers.RecommendedContentCardController
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.{BeforeAndAfterAll, DoNotDiscover}
import org.scalatest.matchers.should.Matchers
import play.api.test.Helpers._

@DoNotDiscover class RecommendedContentCardControllerTest
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

  lazy val contentCardController =
    new RecommendedContentCardController(testContentApiClient, play.api.test.Helpers.stubControllerComponents())

  "Content Card Controller" should "200 when the content is found" in {
    val result = contentCardController.renderHtml(article)(TestRequest())
    status(result) should be(200)
    contentType(result) should be("text/html")
    val stringResult = contentAsString(result).trim
    stringResult.startsWith("<div class")
  }

  it should "return 404 when content is not found" in {
    val result = contentCardController.render(badPath)(TestRequest())
    status(result) should be(404)
  }

}
