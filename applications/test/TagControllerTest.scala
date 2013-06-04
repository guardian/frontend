package test

import org.scalatest.matchers.ShouldMatchers
import org.scalatest.FlatSpec
import play.api.test._
import play.api.test.Helpers._
import controllers.TagController

class TagControllerTest extends FlatSpec with ShouldMatchers {
  
  val tagUrl = "/world/turkey"

  "Tag Controller" should "200 when content type is tag" in Fake {
    val result = TagController.render(tagUrl)(TestRequest())
    status(result) should be(200)
  }

  it should "return JSONP when callback is supplied" in Fake {
    val fakeRequest = FakeRequest(GET, tagUrl + "?callback=foo").withHeaders("host" -> "localhost:9000")
    val result = TagController.render(tagUrl)(fakeRequest)
    status(result) should be(200)
    header("Content-Type", result).get should be("application/javascript")
  }

  it should "internal redirect when content type is not tag" in Fake {
    val result = TagController.render("world/video/2012/feb/10/inside-tibet-heart-protest-video")(TestRequest())
    status(result) should be(200)
    header("X-Accel-Redirect", result).get should be("/type/video/world/video/2012/feb/10/inside-tibet-heart-protest-video")
  }
}