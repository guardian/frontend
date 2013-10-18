package test

import play.api.test._
import play.api.test.Helpers._
import org.scalatest.Matchers
import org.scalatest.FlatSpec


class GalleryControllerTest extends FlatSpec with Matchers {

  val galleryUrl = "news/gallery/2012/may/02/picture-desk-live-kabul-burma"
  val callbackName = "aFunction"

  "Gallery Controller" should "200 when content type is gallery" in Fake {
    val result = controllers.GalleryController.render(galleryUrl)(TestRequest())
    status(result) should be(200)
  }

  it should "return JSONP when callback is supplied" in Fake {
    val fakeRequest = FakeRequest(GET, s"${galleryUrl}?callback=$callbackName")
      .withHeaders("host" -> "localhost:9000")

    val result = controllers.GalleryController.render(galleryUrl)(fakeRequest)
    status(result) should be(200)
    header("Content-Type", result).get should be("application/javascript")
    contentAsString(result) should startWith(s"""${callbackName}({\"config\"""")
  }

  it should "return JSON when .json format is supplied" in Fake {
    val fakeRequest = FakeRequest(GET, s"${galleryUrl}.json")
      .withHeaders("host" -> "localhost:9000")
      .withHeaders("Origin" -> "http://www.theorigin.com")

    val result = controllers.GalleryController.render(galleryUrl)(fakeRequest)
    status(result) should be(200)
    header("Content-Type", result).get should be("application/json")
    contentAsString(result) should startWith("{\"config\"")
  }

  it should "internal redirect when content type is not gallery" in Fake {
    val result = controllers.GalleryController.render("world/video/2012/feb/10/inside-tibet-heart-protest-video")(TestRequest())
    status(result) should be(200)
    header("X-Accel-Redirect", result).get should be("/type/video/world/video/2012/feb/10/inside-tibet-heart-protest-video")
  }

  it should "display an expired message for expired content" in Fake {
    val result = controllers.GalleryController.render("theobserver/gallery/2012/jul/29/1")(TestRequest())
    status(result) should be(410)
    contentAsString(result) should include("Wayne Coyne - in pictures")
    contentAsString(result) should include("This content has been removed as our copyright has expired.")
  }

  it should "return the lightbox JSON when /lightbox.json endpoint is hit" in Fake {
    val fakeRequest = FakeRequest(GET, s"${galleryUrl}/lightbox.json")
      .withHeaders("host" -> "localhost:9000")
      .withHeaders("Origin" -> "http://www.theorigin.com")

    val result = controllers.GalleryController.renderLightbox(galleryUrl)(fakeRequest)
    status(result) should be(200)
    header("Content-Type", result).get should be("application/json")
    contentAsString(result) should startWith("{\"config\"")
    contentAsString(result) should include("gallery--lightbox")
  }
}