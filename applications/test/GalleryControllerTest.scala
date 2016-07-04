package test

import controllers.GalleryController
import play.api.test.Helpers._
import org.scalatest.{DoNotDiscover, Matchers, FlatSpec}

@DoNotDiscover class GalleryControllerTest extends FlatSpec with Matchers with ConfiguredTestSuite {

  val galleryUrl = "news/gallery/2012/may/02/picture-desk-live-kabul-burma"

  val galleryController = new GalleryController

  "Gallery Controller" should "200 when content type is gallery" in {
    val result = galleryController.render(galleryUrl)(TestRequest(s"/$galleryUrl"))
    status(result) should be(200)
  }

  it should "return JSON when .json format is supplied" in {
    val fakeRequest = TestRequest(s"/${galleryUrl}.json")
      .withHeaders("Origin" -> "http://www.theorigin.com")

    val result = galleryController.render(galleryUrl)(fakeRequest)
    status(result) should be(200)
    header("Content-Type", result).get should be("application/json; charset=utf-8")
    contentAsString(result) should startWith("{\"config\"")
  }

  it should "internal redirect when content type is not gallery" in {
    val result = galleryController.render("world/video/2012/feb/10/inside-tibet-heart-protest-video")(TestRequest("/world/video/2012/feb/10/inside-tibet-heart-protest-video"))
    status(result) should be(200)
    header("X-Accel-Redirect", result).get should be("/applications/world/video/2012/feb/10/inside-tibet-heart-protest-video")
  }

  it should "display an expired message for expired content" in {
    val result = galleryController.render("theobserver/gallery/2012/jul/29/1")(TestRequest("/theobserver/gallery/2012/jul/29/1"))
    status(result) should be(200)
    contentAsString(result) should include("Sorry - this page has been removed.")
  }

  it should "return the lightbox JSON when /lightbox.json endpoint is hit" in {
    val fakeRequest = TestRequest(s"/${galleryUrl}/lightbox.json")
      .withHeaders("Origin" -> "http://www.theorigin.com")

    val result = galleryController.lightboxJson(galleryUrl)(fakeRequest)
    status(result) should be(200)
    header("Content-Type", result).get should be("application/json; charset=utf-8")
    contentAsString(result) should startWith("{\"id\"")
  }
}
