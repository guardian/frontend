package test
import controllers.ContentCardController
import org.scalatest.{BeforeAndAfterAll, DoNotDiscover, FlatSpec, Matchers}
import play.api.test.Helpers._
import play.api.test._

@DoNotDiscover class ContentCardControllerTest
  extends FlatSpec
  with Matchers
  with ConfiguredTestSuite
  with BeforeAndAfterAll
  with WithMaterializer
  with WithTestWsClient
  with WithTestContext
  with WithTestContentApiClient {

  val article = "/world/2014/nov/18/hereford-hospital-patient-tested-for-ebola"
  lazy val contentCardController = new ContentCardController(testContentApiClient)

  "Content Card Controller" should "200 when the content is found" in {
      val result = contentCardController.renderHtml(article)(TestRequest())
      status(result) should be(200)
      contentType(result) should be ("text/html")
      val stringResult = contentAsString(result).trim
      stringResult.startsWith("<div class")
  }

  it should "return JSON when .json format is supplied" in {
    val fakeRequest = FakeRequest(GET, s"/embed/card/$article.json")
      .withHeaders("host" -> "localhost:9000")
      .withHeaders("Origin" -> "http://www.theorigin.com")

    val result = contentCardController.render(article)(fakeRequest)
    status(result) should be(200)
    contentType(result).get should be("application/json")

    val resultAsString = contentAsString(result)
    resultAsString should startWith("{\"html\"")

  }

}
