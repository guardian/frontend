package test

import agents.{DeeplyReadAgent, MostViewedAgent}
import com.fasterxml.jackson.core.JsonParseException
import com.gu.facia.client.models.{ConfigJson, FrontJson}
import common.editions.{Uk, Us}
import common.facia.FixtureBuilder
import controllers.{Assets, FaciaControllerImpl}
import experiments.{ActiveExperiments, ParticipationGroups}
import helpers.FaciaTestData
import implicits.FakeRequests
import model.{FrontProperties, PressedPage, SeoData}
import org.mockito.Matchers.{any, anyString}
import org.mockito.Mockito.when
import org.scalatest._
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers
import org.scalatestplus.mockito.MockitoSugar
import play.api.libs.json.{JsArray, JsValue, Json}
import play.api.libs.ws.{WSClient, WSRequest, WSResponse}
import play.api.test.Helpers._
import play.api.test._
import services.{ConfigAgent, OphanApi}

import scala.concurrent.duration._
import scala.concurrent.{Await, Future}

@DoNotDiscover class FaciaControllerTest
    extends AnyFlatSpec
    with FaciaTestData
    with Matchers
    with ConfiguredTestSuite
    with BeforeAndAfterAll
    with FakeRequests
    with BeforeAndAfterEach
    with WithMaterializer
    with WithTestApplicationContext
    with MockitoSugar
    with WithTestFrontJsonFapi
    with WithTestContentApiClient
    with WithAssets
    with PrivateMethodTester {

  lazy val wsClient = mockWsResponse()

  lazy val faciaController = new FaciaControllerImpl(
    fapi,
    play.api.test.Helpers.stubControllerComponents(),
    wsClient,
    new MostViewedAgent(testContentApiClient, new OphanApi(wsClient)),
    new DeeplyReadAgent(testContentApiClient, new OphanApi(wsClient)),
    assets = assets,
  )
  val articleUrl = "/environment/2012/feb/22/capitalise-low-carbon-future"
  val callbackName = "aFunction"
  val frontJson = FrontJson(Nil, None, None, None, None, None, None, None, None, None, None, None, None, None)

  val responsiveRequest = FakeRequest().withHeaders("host" -> "www.theguardian.com")
  val deeplyReadResults = "{}"

  def mockWsResponse(): WSClient = {
    val wsClient = mock[WSClient]
    val mockResponse = mock[WSResponse]
    val mockRequest = mock[WSRequest]

    when(mockResponse.status).thenReturn(200)
    when(mockResponse.body).thenReturn("")
    when(mockResponse.json).thenReturn(Json.parse(deeplyReadResults))

    when(mockRequest.withRequestTimeout(any())).thenReturn(mockRequest)
    when(mockRequest.addHttpHeaders("Content-Type" -> "application/json")).thenReturn(mockRequest)

    when(mockRequest.post(anyString())(any())).thenReturn(Future.successful(mockResponse))
    when(mockRequest.get()).thenReturn(Future.successful(mockResponse))

    when(wsClient.url("http://localhost:3030/Front")).thenReturn(mockRequest)
    when(wsClient.url("https://localhost/deeplyread?country=gb&api-key=none")).thenReturn(mockRequest)
    when(wsClient.url("https://localhost/deeplyread?country=us&api-key=none")).thenReturn(mockRequest)
    when(wsClient.url("https://localhost/deeplyread?country=au&api-key=none")).thenReturn(mockRequest)
    when(wsClient.url("https://localhost/deeplyread?country=international&api-key=none")).thenReturn(mockRequest)

    wsClient
  }

  override def beforeAll(): Unit = {
    val refresh = ConfigAgent.refreshWith(
      ConfigJson(
        fronts = Map(
          "music" -> frontJson,
          "inline-embeds" -> frontJson,
          "uk" -> frontJson,
          "au/media" -> frontJson,
          "email/uk/daily" -> frontJson,
          "europe" -> frontJson,
        ),
        collections = Map.empty,
      ),
    )
    conf.switches.Switches.FaciaInlineEmbeds.switchOn()
    Await.result(refresh, 3.seconds)
  }

  it should "serve an X-Accel-Redirect for something it doesn't know about" in {
    val result = faciaController.renderFront("does-not-exist")(TestRequest()) // Film is actually a facia front ON PROD
    status(result) should be(200)
    header("X-Accel-Redirect", result) should be(Some("/applications/does-not-exist"))
  }

  it should "serve an X-Accel-Redirect for /rss that it doesn't know about" in {
    val fakeRequest = FakeRequest("GET", "/does-not-exist/rss")

    val result = faciaController.renderFrontRss("does-not-exist")(fakeRequest)
    status(result) should be(200)
    header("X-Accel-Redirect", result) should be(Some("/rss_server/does-not-exist/rss"))
  }

  it should "keep query params for X-Accel-Redirect" in {
    val fakeRequest = FakeRequest("GET", "/does-not-exist?page=77")

    val result = faciaController.renderFront("does-not-exist")(fakeRequest)
    status(result) should be(200)
    header("X-Accel-Redirect", result) should be(Some("/applications/does-not-exist?page=77"))
  }

  it should "keep query params for X-Accel-Redirect with RSS" in {
    val fakeRequest = FakeRequest("GET", "/does-not-exist/rss?page=77")

    val result = faciaController.renderFrontRss("does-not-exist")(fakeRequest)
    status(result) should be(200)
    header("X-Accel-Redirect", result) should be(Some("/rss_server/does-not-exist/rss?page=77"))
  }

  it should "not serve X-Accel for a path facia serves" in {
    val fakeRequest = FakeRequest("GET", "/music")

    val result = faciaController.renderFront("music")(fakeRequest)
    header("X-Accel-Redirect", result) should be(None)
  }

  it should "redirect to applications when 'page' query param" in {
    val fakeRequest = FakeRequest("GET", "/music?page=77")

    val result = faciaController.renderFront("music")(fakeRequest)
    status(result) should be(200)
    header("X-Accel-Redirect", result) should be(Some("/applications/music?page=77"))
  }

  it should "not redirect to applications when any other query param" in {
    val fakeRequest = FakeRequest("GET", "/music?id=77")

    val result = faciaController.renderFront("music")(fakeRequest)
    header("X-Accel-Redirect", result) should be(None)
  }

  it should "redirect to editionalised fronts" in {
    val ukRequest = FakeRequest("GET", "/").from(Uk)
    val ukResult = faciaController.renderFront("")(ukRequest)
    header("Location", ukResult).head should endWith("/uk")

    val usRequest = FakeRequest("GET", "/").from(Us)
    val usResult = faciaController.renderFront("")(usRequest)
    header("Location", usResult).head should endWith("/us")
  }

  it should "redirect to editionalised pages" in {
    val ukRequest = FakeRequest("GET", "/technology").from(Uk)
    val ukResult = faciaController.renderFront("technology")(ukRequest)
    header("Location", ukResult).head should endWith("/uk/technology")

    val usRequest = FakeRequest("GET", "/technology").from(Us)
    val usResult = faciaController.renderFront("technology")(usRequest)
    header("Location", usResult).head should endWith("/us/technology")
  }

  it should "understand the international edition" in {

    val international = FakeRequest("GET", "/").withHeaders("X-GU-Edition" -> "INT")
    val redirectToInternational = faciaController.renderFront("")(international)
    header("Location", redirectToInternational).head should endWith("/international")
  }

  it should "obey when the international edition is set by cookie" in {

    val control = FakeRequest("GET", "/").withHeaders(
      "X-GU-Edition" -> "INT",
      "X-GU-Edition-From-Cookie" -> "true",
    )
    val redirectToUk = faciaController.renderFront("")(control)
    header("Location", redirectToUk).head should endWith("/international")
  }

  it should "send international traffic ot the UK version of editionalised sections" in {
    val international = FakeRequest("GET", "/commentisfree")
      .withHeaders("X-GU-Edition" -> "INTL", "X-GU-International" -> "international")
    val redirectToInternational = faciaController.renderFront("commentisfree")(international)
    header("Location", redirectToInternational).head should endWith("/uk/commentisfree")
  }

  it should "render correct amount of fronts in mf2 format (no section or edition provided)" in {
    val count = 2
    val request = FakeRequest("GET", s"/container/count/$count/offset/0/mf2.json")
    val result = faciaController.renderSomeFrontContainersMf2(count, 0)(request)
    status(result) should be(200)
    (contentAsJson(result) \ "items").as[JsArray].value.size should be(count)
  }

  it should "render fronts in mf2 format (no edition provided)" in {
    val section = "music"
    val count = 2
    val request = FakeRequest("GET", s"/container/count/$count/offset/0/section/$section/mf2.json")
    val result = faciaController.renderSomeFrontContainersMf2(count, 0, section)(request)
    status(result) should be(200)
    (contentAsJson(result) \ "items").as[JsArray].value.size should be(count)
  }

  it should "render json email fronts" in {
    val emailRequest = FakeRequest("GET", "/email/uk/daily.emailjson")
    val emailJsonResponse = faciaController.renderFront("email/uk/daily")(emailRequest)
    status(emailJsonResponse) shouldBe 200
    val jsonResponse = contentAsJson(emailJsonResponse)
    val (key, html) = jsonResponse.as[Map[String, String]].head
    key shouldBe "body"
    html should include("<!DOCTYPE html")
    val responseHeaders = headers(emailJsonResponse)
    responseHeaders("Surrogate-Control") should include("max-age=60")
  }

  it should "render txt email fronts" in {
    val emailRequest = FakeRequest("GET", "/email/uk/daily.emailtxt")
    val emailJsonResponse = faciaController.renderFront("email/uk/daily")(emailRequest)
    status(emailJsonResponse) shouldBe 200
    val jsonResponse = contentAsJson(emailJsonResponse)
    val (key, text) = jsonResponse.as[Map[String, String]].head
    key shouldBe "body"
    text should not include "<!DOCTYPE html"
    text should include("The Guardian Today | The Guardian")
    val responseHeaders = headers(emailJsonResponse)
    responseHeaders("Surrogate-Control") should include("max-age=60")
  }

  it should "render email fronts" in {
    val emailRequest = FakeRequest("GET", "/email/uk/daily")
    val emailHtmlResponse = faciaController.renderFront("email/uk/daily")(emailRequest)
    status(emailHtmlResponse) shouldBe 200
    assertThrows[JsonParseException](contentAsJson(emailHtmlResponse))
    contentAsString(emailHtmlResponse)
    contentAsString(emailHtmlResponse) should include("<!DOCTYPE html")
    val responseHeaders = headers(emailHtmlResponse)
    responseHeaders("Surrogate-Control") should include("max-age=900")
  }

  it should "render using DCR if ?dcr" in {
    val fakeRequest = FakeRequest("GET", "/uk?dcr")
    val result = faciaController.renderFront("uk")(fakeRequest)
    status(result) should be(200)
    header("X-GU-Dotcomponents", result) should be(Some("true"))
  }

  it should "render using Frontend if ?dcr=false" in {
    val fakeRequest = FakeRequest("GET", "/uk?dcr=false")
    val result = faciaController.renderFront("uk")(fakeRequest)
    status(result) should be(200)
    header("X-GU-Dotcomponents", result) should be(None)
  }

  "FaciaController.replaceFaciaPageCollections" should "replace the collections of a pressed page with those on another pressed page" in {
    val europePage: Option[(PressedPage, Boolean)] = Some(
      europeFaciaPage,
      false,
    )
    val europeBetaPage: Option[(PressedPage, Boolean)] = Some(
      europeBetaFaciaPageWithTargetedTerritory,
      true,
    )
    val replaceFaciaPageCollections =
      PrivateMethod[Option[(PressedPage, Boolean)]](Symbol("replaceFaciaPageCollections"))
    val result = faciaController invokePrivate replaceFaciaPageCollections(europePage, europeBetaPage)
    val (resultPressedPage, targetedTerritories) = result.get
    // The page metadata should remain unchanged
    resultPressedPage.id should be("europe")
    resultPressedPage.id should not be "europe-beta"
    // The collections should come from the replacement page not the original page
    resultPressedPage.collections.exists(_ == europeBetaFaciaPageWithTargetedTerritory.collections(0)) should be(true)
    resultPressedPage.collections.exists(_ == europeFaciaPage.collections(0)) should be(false)
    // The value for targetedTerritories should come from the page with replacement collections
    targetedTerritories should be(true)
  }
}
