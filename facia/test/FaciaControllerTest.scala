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

  ignore should "200 when content type is front" in Fake {
    val result = FaciaController.renderFront("uk")(TestRequest())
    status(result) should be(200)
  }

  ignore should "redirect base page to edition page if on www.theguardian.com" in Fake {

    val result = FaciaController.editionRedirect("")(responsiveRequest.withHeaders("X-GU-Edition" -> "US"))
    status(result) should be(303)
    header("Location", result) should be (Some("/us"))

    val result2 = FaciaController.editionRedirect("culture")(responsiveRequest.withHeaders("X-GU-Edition" -> "AU"))
    status(result2) should be(303)
    header("Location", result2) should be (Some("/au/culture"))

  }

  ignore should "understand the editionalised network front" in Fake {
    val result2 = FaciaController.renderFront("uk")(TestRequest())
    status(result2) should be(200)
  }

  ignore should "understand editionalised section fronts" in Fake {
    val result2 = FaciaController.renderFront("uk/culture")(TestRequest())
    status(result2) should be(200)
  }

  ignore should "return JSONP when callback is supplied to front" in Fake {
    val fakeRequest = FakeRequest(GET, s"?callback=$callbackName")
      .withHeaders("host" -> "localhost:9000")

    val result = FaciaController.renderFront("uk")(fakeRequest)
    status(result) should be(200)
    contentType(result).get should be("application/javascript")
    contentAsString(result) should startWith(s"""$callbackName({\"html\"""")
  }

  ignore should "return JSON when .json format is supplied to front" in Fake {
    val fakeRequest = FakeRequest("GET", ".json")
      .withHeaders("Host" -> "localhost:9000")
      .withHeaders("Origin" -> "http://www.theorigin.com")

    val result = FaciaController.renderFrontJson("uk")(fakeRequest)
    status(result) should be(200)
    contentType(result).get should be("application/json")
    contentAsString(result) should startWith("{\"html\"")
  }

  ignore should "200 when hitting the front" in Fake {
    val result = FaciaController.renderFront("uk")(TestRequest())
    status(result) should be(200)
  }

  it should "serve RSS for a path it knows" in Fake {
    val fakeRequest = FakeRequest("GET", "/uk/rss")

    val result = FaciaController.renderFront("uk")(fakeRequest)
    status(result) should be(200)
    contentType(result) should be(Some("text/xml"))
    contentAsString(result) should startWith("<?xml")
  }

  it should "serve an X-Accel-Redirect for something it doesn't know about" in {
    val result = FaciaController.renderFront("film")(TestRequest()) //Film is actually a facia front ON PROD
    status(result) should be(200)
    header("X-Accel-Redirect", result) should be (Some("/applications/film"))
  }

  it should "serve an X-Accel-Redirect for /rss that it doesn't know about" in {
    val fakeRequest = FakeRequest("GET", "/film/rss")

    val result = FaciaController.renderFrontRss("film")(fakeRequest) //Film is actually a facia front ON PROD
    status(result) should be(200)
    header("X-Accel-Redirect", result) should be (Some("/applications/film/rss"))
  }

  it should "keep query params for X-Accel-Redirect" in {
    val fakeRequest = FakeRequest("GET", "/film?page=77")

    val result = FaciaController.renderFront("film")(fakeRequest) //Film is actually a facia front ON PROD
    status(result) should be(200)
    header("X-Accel-Redirect", result) should be (Some("/applications/film?page=77"))
  }

  it should "keep query params for X-Accel-Redirect with RSS" in {
    val fakeRequest = FakeRequest("GET", "/film/rss?page=77")

    val result = FaciaController.renderFrontRss("film")(fakeRequest) //Film is actually a facia front ON PROD
    status(result) should be(200)
    header("X-Accel-Redirect", result) should be (Some("/applications/film/rss?page=77"))
  }
}
