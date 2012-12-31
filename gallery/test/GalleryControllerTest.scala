package test

import play.api.test._
import play.api.test.Helpers._
import play.api.mvc.AsyncResult
import org.scalatest.matchers.ShouldMatchers
import org.scalatest.FlatSpec

class GalleryControllerTest extends FlatSpec with ShouldMatchers {

  "Gallery Controller" should "200 when content type is gallery" in Fake {
    val result = controllers.GalleryController.render("news/gallery/2012/may/02/picture-desk-live-kabul-burma")(FakeRequest())
    status(await(result.asInstanceOf[AsyncResult].result)) should be(200)
  }

  it should "404 when content type is not gallery" in Fake {
    val result = controllers.GalleryController.render("world/video/2012/feb/10/inside-tibet-heart-protest-video")(FakeRequest())
    status(await(result.asInstanceOf[AsyncResult].result)) should be(404)
  }
}