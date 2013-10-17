package test

import play.api.test._
import play.api.test.Helpers._
import org.scalatest.Matchers
import org.scalatest.{BeforeAndAfterAll, FlatSpec}
import common.ExecutionContexts
import controllers.FaciaController

class FaciaControllerTest extends FlatSpec with Matchers with BeforeAndAfterAll with ExecutionContexts {

  val articleUrl = "/environment/2012/feb/22/capitalise-low-carbon-future"
  val callbackName = "aFunction"

  val responsiveRequest = FakeRequest().withHeaders("host" -> "www.theguardian.com")

  object Front extends TestFront
  object FaciaController extends FaciaController {
    override val front = Front
  }

  "FaciaController" should "200 when content type is front" in Fake {
    val result = FaciaController.renderEditionFront("uk")(TestRequest())
    status(result) should be(200)
  }

  it should "redirect base page to edition page if on www.theguardian.com" in Fake {

    val result = FaciaController.renderFront("")(responsiveRequest.withHeaders("X-GU-Edition" -> "US"))
    status(result) should be(303)
    header("Location", result) should be (Some("/us"))

    val result2 = FaciaController.renderFront("culture")(responsiveRequest.withHeaders("X-GU-Edition" -> "AU"))
    status(result2) should be(303)
    header("Location", result2) should be (Some("/au/culture"))

  }

  it should "understand the editionalised network front" in Fake {
    val result2 = FaciaController.renderEditionFront("uk")(TestRequest())
    status(result2) should be(200)
  }

  it should "understand editionalised section fronts" in Fake {
    val result2 = FaciaController.renderEditionSectionFront("uk/culture")(TestRequest())
    status(result2) should be(200)
  }

  it should "return JSONP when callback is supplied to front" in Fake {
    val fakeRequest = FakeRequest(GET, s"?callback=$callbackName")
      .withHeaders("host" -> "localhost:9000")

    val result = FaciaController.renderEditionFront("uk")(fakeRequest)
    status(result) should be(200)
    contentType(result).get should be("application/javascript")
    contentAsString(result) should startWith(s"""$callbackName({\"html\"""")
  }

  it should "return JSON when .json format is supplied to front" in Fake {
    val fakeRequest = FakeRequest("GET", ".json")
      .withHeaders("Host" -> "localhost:9000")
      .withHeaders("Origin" -> "http://www.theorigin.com")

    val result = FaciaController.renderEditionFrontJson("uk")(fakeRequest)
    status(result) should be(200)
    contentType(result).get should be("application/json")
    contentAsString(result) should startWith("{\"html\"")
  }

  it should "200 when content type is front trails" in Fake {
    //Fronts never redirected, this redirects if you hit naked slash
    val result = FaciaController.renderTrails("")(TestRequest())
    status(result) should be(303)

    val result2 = FaciaController.renderTrails("uk")(TestRequest())
    status(result2) should be(200)
  }

  it should "return JSONP when callback is supplied to front trails" in Fake {
    val fakeRequest = FakeRequest(GET, s"/culture/trails?callback=$callbackName")
      .withHeaders("host" -> "localhost:9000")

    val result = FaciaController.renderTrails("uk")(fakeRequest)
    status(result) should be(200)
    contentType(result).get should be("application/javascript")
    contentAsString(result) should startWith(s"""$callbackName({\"html\"""")
  }

  it should "return JSON when .json format is supplied to front trails" in Fake {
    val fakeRequest = FakeRequest("GET", "/culture/trails.json")
      .withHeaders("Host" -> "localhost:9000")
      .withHeaders("Origin" -> "http://www.theorigin.com")

    val result = FaciaController.renderTrails("uk")(fakeRequest)
    status(result) should be(200)
    contentType(result).get should be("application/json")
    contentAsString(result) should startWith("{\"html\"")
  }

  it should "200 when hitting the front" in Fake {
    val result = FaciaController.renderEditionFront("uk")(TestRequest())
    status(result) should be(200)
  }
}
