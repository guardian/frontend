package test

import com.gu.facia.client.models.{FrontJson, ConfigJson}
import common.editions.{Us, Uk}
import implicits.FakeRequests
import play.api.test._
import play.api.test.Helpers._
import common.ExecutionContexts
import services.ConfigAgent
import org.scalatest._

@DoNotDiscover class FaciaControllerTest extends FlatSpec with Matchers with ExecutionContexts with ConfiguredTestSuite
  with BeforeAndAfterAll with FakeRequests with BeforeAndAfterEach {

  val articleUrl = "/environment/2012/feb/22/capitalise-low-carbon-future"
  val callbackName = "aFunction"
  val frontJson = FrontJson(Nil, None, None, None, None, None, None, None, None, None, None, None, None, None)

  val responsiveRequest = FakeRequest().withHeaders("host" -> "www.theguardian.com")

  override def beforeAll() {
    ConfigAgent.refreshWith(
      ConfigJson(
        fronts = Map("music" -> frontJson, "inline-embeds" -> frontJson),
        collections = Map.empty)
    )
    conf.switches.Switches.FaciaInlineEmbeds.switchOn()
  }

  it should "serve an X-Accel-Redirect for something it doesn't know about" in {
    val result = test.faciaController.renderFront("does-not-exist")(TestRequest()) //Film is actually a facia front ON PROD
    status(result) should be(200)
    header("X-Accel-Redirect", result) should be (Some("/applications/does-not-exist"))
  }

  it should "serve an X-Accel-Redirect for /rss that it doesn't know about" in {
    val fakeRequest = FakeRequest("GET", "/does-not-exist/rss")

    val result = test.faciaController.renderFrontRss("does-not-exist")(fakeRequest)
    status(result) should be(200)
    header("X-Accel-Redirect", result) should be (Some("/rss_server/does-not-exist/rss"))
  }

  it should "keep query params for X-Accel-Redirect" in {
    val fakeRequest = FakeRequest("GET", "/does-not-exist?page=77")

    val result = test.faciaController.renderFront("does-not-exist")(fakeRequest)
    status(result) should be(200)
    header("X-Accel-Redirect", result) should be (Some("/applications/does-not-exist?page=77"))
  }

  it should "keep query params for X-Accel-Redirect with RSS" in {
    val fakeRequest = FakeRequest("GET", "/does-not-exist/rss?page=77")

    val result = test.faciaController.renderFrontRss("does-not-exist")(fakeRequest)
    status(result) should be(200)
    header("X-Accel-Redirect", result) should be (Some("/rss_server/does-not-exist/rss?page=77"))
  }

  it should "not serve X-Accel for a path facia serves" in {
    val fakeRequest = FakeRequest("GET", "/music")

    val result = test.faciaController.renderFront("music")(fakeRequest)
    header("X-Accel-Redirect", result) should be (None)
  }

  it should "redirect to applications when 'page' query param" in {
    val fakeRequest = FakeRequest("GET", "/music?page=77")

    val result = test.faciaController.renderFront("music")(fakeRequest)
    status(result) should be(200)
    header("X-Accel-Redirect", result) should be (Some("/applications/music?page=77"))
  }

  it should "not redirect to applications when any other query param" in {
    val fakeRequest = FakeRequest("GET", "/music?id=77")

    val result = test.faciaController.renderFront("music")(fakeRequest)
    header("X-Accel-Redirect", result) should be (None)
  }

  it should "redirect to editionalised fronts" in {
    val ukRequest = FakeRequest("GET", "/").from(Uk)
    val ukResult = test.faciaController.renderFront("")(ukRequest)
    header("Location", ukResult).head should endWith ("/uk")

    val usRequest = FakeRequest("GET", "/").from(Us)
    val usResult = test.faciaController.renderFront("")(usRequest)
    header("Location", usResult).head should endWith ("/us")
  }

  it should "redirect to editionalised pages" in {
    val ukRequest = FakeRequest("GET", "/technology").from(Uk)
    val ukResult = test.faciaController.renderFront("technology")(ukRequest)
    header("Location", ukResult).head should endWith ("/uk/technology")

    val usRequest = FakeRequest("GET", "/technology").from(Us)
    val usResult = test.faciaController.renderFront("technology")(usRequest)
    header("Location", usResult).head should endWith ("/us/technology")
  }

  it should "understand the international edition" in {


    val international = FakeRequest("GET", "/").withHeaders("X-GU-Edition" -> "INT")
    val redirectToInternational = test.faciaController.renderFront("")(international)
    header("Location", redirectToInternational).head should endWith ("/international")
  }

  it should "obey when the international edition is set by cookie" in {

    val control = FakeRequest("GET", "/").withHeaders(
      "X-GU-Edition" -> "INT",
      "X-GU-Edition-From-Cookie" -> "true"
    )
    val redirectToUk = test.faciaController.renderFront("")(control)
    header("Location", redirectToUk).head should endWith ("/international")
  }

  it should "send international traffic ot the UK version of editionalised sections" in {
    val international = FakeRequest("GET", "/commentisfree").withHeaders("X-GU-Edition" -> "INTL", "X-GU-International" -> "international")
    val redirectToInternational = test.faciaController.renderFront("commentisfree")(international)
    header("Location", redirectToInternational).head should endWith ("/uk/commentisfree")
  }

  it should "list the alterative options for a path by section and edition" in {
    test.faciaController.alternativeEndpoints("uk/lifeandstyle") should be (List("lifeandstyle", "uk"))
    test.faciaController.alternativeEndpoints("uk") should be (List("uk"))
    test.faciaController.alternativeEndpoints("uk/business/stock-markets") should be (List("business", "uk"))
  }

  it should "render fronts with content that has been pre-fetched from facia-press" in {
    val request = FakeRequest("GET", "/inline-embeds").from(Uk)
    val future = test.faciaController.renderFront("inline-embeds")(request)
    contentAsString(future) should include ("""<div class="keep-it-in-the-ground__wrapper""")
  }
}
