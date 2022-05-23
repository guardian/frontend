package test

import controllers.GalleryController
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers
import play.api.test.Helpers._
import org.scalatest.{BeforeAndAfterAll, DoNotDiscover}

@DoNotDiscover class GalleryControllerTest
    extends AnyFlatSpec
    with Matchers
    with ConfiguredTestSuite
    with BeforeAndAfterAll
    with WithMaterializer
    with WithTestWsClient
    with WithTestApplicationContext
    with WithTestContentApiClient {

  val galleryUrl = "news/gallery/2012/may/02/picture-desk-live-kabul-burma"

  lazy val galleryController =
    new GalleryController(testContentApiClient, play.api.test.Helpers.stubControllerComponents())

  "Gallery Controller" should "200 when content type is gallery" in {
    val result = galleryController.render(galleryUrl)(TestRequest(s"/$galleryUrl"))
    status(result) should be(200)
  }

  it should "return JSON when .json format is supplied" in {
    val fakeRequest = TestRequest(s"/$galleryUrl.json")
      .withHeaders("Origin" -> "http://www.theorigin.com")

    val result = galleryController.render(galleryUrl)(fakeRequest)
    status(result) should be(200)
    contentType(result) shouldBe Some("application/json")
    contentAsString(result) should startWith("{\"config\"")
  }

  it should "internal redirect when content type is not gallery" in {
    val result = galleryController.render("world/video/2012/feb/10/inside-tibet-heart-protest-video")(
      TestRequest("/world/video/2012/feb/10/inside-tibet-heart-protest-video"),
    )
    status(result) should be(200)
    header("X-Accel-Redirect", result).get should be(
      "/applications/world/video/2012/feb/10/inside-tibet-heart-protest-video",
    )
  }

  it should "display an expired message for expired content" in {
    val result =
      galleryController.render("theobserver/gallery/2012/jul/29/1")(TestRequest("/theobserver/gallery/2012/jul/29/1"))
    status(result) should be(410)
    contentAsString(result) should include("Sorry - this page has been removed.")
  }

  it should "return the lightbox JSON when /lightbox.json endpoint is hit" in {
    val fakeRequest = TestRequest(s"/$galleryUrl/lightbox.json")
      .withHeaders("Origin" -> "http://www.theorigin.com")

    val result = galleryController.lightboxJson(galleryUrl)(fakeRequest)
    status(result) should be(200)
    contentType(result) shouldBe Some("application/json")
    contentAsString(result) should startWith("{\"id\"")
  }
}
