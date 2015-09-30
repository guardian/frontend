package test

import com.gu.facia.client.models.{FrontJson, ConfigJson}
import common.editions.{Us, Uk}
import conf.switches.Switches
import implicits.FakeRequests
import play.api.test._
import play.api.test.Helpers._
import org.scalatest._
import common.ExecutionContexts
import controllers.FaciaController
import services.ConfigAgent

@DoNotDiscover class FaciaControllerTest extends FlatSpec with Matchers with ExecutionContexts with ConfiguredTestSuite
                                                      with BeforeAndAfterAll with FakeRequests with BeforeAndAfterEach {

  val articleUrl = "/environment/2012/feb/22/capitalise-low-carbon-future"
  val callbackName = "aFunction"

  val responsiveRequest = FakeRequest().withHeaders("host" -> "www.theguardian.com")

  override def beforeAll() {
    ConfigAgent.refreshWith(
      ConfigJson(
        fronts = Map("music" -> FrontJson(Nil, None, None, None, None, None, None, None, None, None, None, None, None)),
        collections = Map.empty)
    )
  }

  override def afterEach(): Unit = {
    Switches.InternationalEditionSwitch.switchOff()
  }

  it should "serve an X-Accel-Redirect for something it doesn't know about" in {
    val result = FaciaController.renderFront("does-not-exist")(TestRequest()) //Film is actually a facia front ON PROD
    status(result) should be(200)
    header("X-Accel-Redirect", result) should be (Some("/applications/does-not-exist"))
  }

  it should "serve an X-Accel-Redirect for /rss that it doesn't know about" in {
    val fakeRequest = FakeRequest("GET", "/does-not-exist/rss")

    val result = FaciaController.renderFrontRss("does-not-exist")(fakeRequest)
    status(result) should be(200)
    header("X-Accel-Redirect", result) should be (Some("/rss_server/does-not-exist/rss"))
  }

  it should "keep query params for X-Accel-Redirect" in {
    val fakeRequest = FakeRequest("GET", "/does-not-exist?page=77")

    val result = FaciaController.renderFront("does-not-exist")(fakeRequest)
    status(result) should be(200)
    header("X-Accel-Redirect", result) should be (Some("/applications/does-not-exist?page=77"))
  }

  it should "keep query params for X-Accel-Redirect with RSS" in {
    val fakeRequest = FakeRequest("GET", "/does-not-exist/rss?page=77")

    val result = FaciaController.renderFrontRss("does-not-exist")(fakeRequest)
    status(result) should be(200)
    header("X-Accel-Redirect", result) should be (Some("/rss_server/does-not-exist/rss?page=77"))
  }

  it should "not serve X-Accel for a path facia serves" in {
    val fakeRequest = FakeRequest("GET", "/music")

    val result = FaciaController.renderFront("music")(fakeRequest)
    header("X-Accel-Redirect", result) should be (None)
  }

  it should "redirect to applications when 'page' query param" in {
    val fakeRequest = FakeRequest("GET", "/music?page=77")

    val result = FaciaController.renderFront("music")(fakeRequest)
    status(result) should be(200)
    header("X-Accel-Redirect", result) should be (Some("/applications/music?page=77"))
  }

  it should "not redirect to applications when any other query param" in {
    val fakeRequest = FakeRequest("GET", "/music?id=77")

    val result = FaciaController.renderFront("music")(fakeRequest)
    header("X-Accel-Redirect", result) should be (None)
  }

  it should "redirect to editionalised fronts" in {
    val ukRequest = FakeRequest("GET", "/").from(Uk)
    val ukResult = FaciaController.renderFront("")(ukRequest)
    header("Location", ukResult).head should endWith ("/uk")

    val usRequest = FakeRequest("GET", "/").from(Us)
    val usResult = FaciaController.renderFront("")(usRequest)
    header("Location", usResult).head should endWith ("/us")
  }

  it should "redirect to editionalised pages" in {
    val ukRequest = FakeRequest("GET", "/technology").from(Uk)
    val ukResult = FaciaController.renderFront("technology")(ukRequest)
    header("Location", ukResult).head should endWith ("/uk/technology")

    val usRequest = FakeRequest("GET", "/technology").from(Us)
    val usResult = FaciaController.renderFront("technology")(usRequest)
    header("Location", usResult).head should endWith ("/us/technology")
  }

  it should "understand the international edition" in {

    Switches.InternationalEditionSwitch.switchOn()

    val international = FakeRequest("GET", "/").withHeaders("X-GU-Edition" -> "INTL", "X-GU-International" -> "international")
    val redirectToInternational = FaciaController.renderFront("")(international)
    header("Location", redirectToInternational).head should endWith ("/international")

    val ukOptInRequest = FakeRequest("GET", "/").withHeaders("X-GU-Edition" -> "UK", "X-GU-International" -> "international")
    val redirect = FaciaController.renderFront("")(ukOptInRequest)
    header("Location", redirect).head should endWith ("/uk")

    Switches.InternationalEditionSwitch.switchOff()
    val international2 = FakeRequest("GET", "/").withHeaders("X-GU-Edition" -> "INTL", "X-GU-International" -> "international")
    val redirectToUk2 = FaciaController.renderFront("")(international2)
    header("Location", redirectToUk2).head should endWith ("/uk")

  }

  it should "obey when the international edition is set by cookie" in {
    Switches.InternationalEditionSwitch.switchOn()

    val control = FakeRequest("GET", "/").withHeaders(
      "X-GU-Edition" -> "INTL",
      "X-GU-International" -> "control",
      "X-GU-Edition-From-Cookie" -> "true"
    )
    val redirectToUk = FaciaController.renderFront("")(control)
    header("Location", redirectToUk).head should endWith ("/international")
  }

  it should "obey the control group when the international edition is not set by cookie" in {
    Switches.InternationalEditionSwitch.switchOn()

    val control = FakeRequest("GET", "/").withHeaders(
      "X-GU-Edition" -> "INTL",
      "X-GU-International" -> "control"
    )
    val redirectToUk = FaciaController.renderFront("")(control)
    header("Location", redirectToUk).head should endWith ("/uk")
  }

  it should "send international traffic ot the UK version of editionalised sections" in {

    Switches.InternationalEditionSwitch.switchOn()

    val international = FakeRequest("GET", "/commentisfree").withHeaders("X-GU-Edition" -> "INTL", "X-GU-International" -> "international")
    val redirectToInternational = FaciaController.editionRedirect("commentisfree")(international)
    header("Location", redirectToInternational).head should endWith ("/uk/commentisfree")
  }

  it should "list the alterative options for a path by section and edition" in {
    FaciaController.alternativeEndpoints("uk/lifeandstyle") should be (List("lifeandstyle", "uk"))
    FaciaController.alternativeEndpoints("uk") should be (List("uk"))
    FaciaController.alternativeEndpoints("uk/business/stock-markets") should be (List("business", "uk"))
  }
}
