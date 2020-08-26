package test

import controllers.{RecommendedContentCardController, RichLinkController}
import org.scalatest.{BeforeAndAfterAll, DoNotDiscover, FlatSpec, Matchers}
import play.api.test.Helpers.{contentAsString, contentType, _}
import play.api.test._

@DoNotDiscover class OnwardContentCardControllerTest
    extends FlatSpec
    with Matchers
    with ConfiguredTestSuite
    with BeforeAndAfterAll
    with WithMaterializer
    with WithTestWsClient
    with WithTestApplicationContext
    with WithTestContentApiClient {

  val article = "/world/2014/nov/18/hereford-hospital-patient-tested-for-ebola"

  lazy val richLinkController =
    new RichLinkController(testContentApiClient, play.api.test.Helpers.stubControllerComponents())

  "An OnwardContentController" should "return JSON when .json format is supplied" in {
    val fakeRequest = FakeRequest(GET, s"/embed/card/$article.json")
      .withHeaders("host" -> "localhost:9000")
      .withHeaders("Origin" -> "http://www.theorigin.com")

    val result = richLinkController.render(article)(fakeRequest)
    status(result) should be(200)
    contentType(result).get should be("application/json")
    contentAsString(result) should startWith("{\"html\"")
  }

}
