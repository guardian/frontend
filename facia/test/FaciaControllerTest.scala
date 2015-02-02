package test

import com.gu.facia.client.models.{FrontJson, ConfigJson}
import common.editions.{Us, Uk}
import implicits.FakeRequests
import play.api.test._
import play.api.test.Helpers._
import org.scalatest.{BeforeAndAfterAll, DoNotDiscover, Matchers, FlatSpec}
import common.ExecutionContexts
import controllers.FaciaController
import services.ConfigAgent

@DoNotDiscover class FaciaControllerTest extends FlatSpec with Matchers with ExecutionContexts with ConfiguredTestSuite with BeforeAndAfterAll with FakeRequests {

  val articleUrl = "/environment/2012/feb/22/capitalise-low-carbon-future"
  val callbackName = "aFunction"

  val responsiveRequest = FakeRequest().withHeaders("host" -> "www.theguardian.com")

  override def beforeAll() {
    ConfigAgent.refreshWith(
      ConfigJson(
        fronts = Map("music" -> FrontJson(Nil, None, None, None, None, None, None, None, None, None, None, None)),
        collections = Map.empty)
    )
  }

  "FaciaController" should "200 when content type is front" in {
    val result = FaciaController.renderFront("uk")(TestRequest())
    status(result) should be(200)
  }

  it should "serve an X-Accel-Redirect for something it doesn't know about" in {
    val result = FaciaController.renderFront("film")(TestRequest()) //Film is actually a facia front ON PROD
    status(result) should be(200)
    header("X-Accel-Redirect", result) should be (Some("/applications/film"))
  }

  it should "serve an X-Accel-Redirect for /rss that it doesn't know about" in {
    val fakeRequest = FakeRequest("GET", "/film/rss")

    val result = FaciaController.renderFrontRss("film")(fakeRequest)
    status(result) should be(200)
    header("X-Accel-Redirect", result) should be (Some("/rss_server/film/rss"))
  }

  it should "keep query params for X-Accel-Redirect" in {
    val fakeRequest = FakeRequest("GET", "/film?page=77")

    val result = FaciaController.renderFront("film")(fakeRequest)
    status(result) should be(200)
    header("X-Accel-Redirect", result) should be (Some("/applications/film?page=77"))
  }

  it should "keep query params for X-Accel-Redirect with RSS" in {
    val fakeRequest = FakeRequest("GET", "/film/rss?page=77")

    val result = FaciaController.renderFrontRss("film")(fakeRequest)
    status(result) should be(200)
    header("X-Accel-Redirect", result) should be (Some("/rss_server/film/rss?page=77"))
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
}
