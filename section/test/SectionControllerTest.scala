package test

import play.api.test._
import play.api.test.Helpers._
import org.scalatest.matchers.ShouldMatchers
import org.scalatest.FlatSpec

class SectionControllerTest extends FlatSpec with ShouldMatchers {

  "Section Controller" should "200 when content type is front" in Fake {
    val result = controllers.SectionController.render("books")(FakeRequest())
    status(result) should be(200)
  }

  it should "404 when content type is not front" in Fake {
    val result = controllers.SectionController.render("world/video/2012/feb/10/inside-tibet-heart-protest-video")(FakeRequest())
    status(result) should be(404)
  }
}