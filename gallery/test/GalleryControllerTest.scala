package test

import play.api.test._
import play.api.test.Helpers._
import org.scalatest.matchers.ShouldMatchers
import org.scalatest.FlatSpec

class GalleryControllerTest extends FlatSpec with ShouldMatchers {

  "Gallery Controller" should "200 when content type is gallery" in Fake {
    val result = controllers.GalleryController.render("news/gallery/2012/may/02/picture-desk-live-kabul-burma")(TestRequest())
    status(result) should be(200)
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
}