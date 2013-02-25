package test

import play.api.test._
import play.api.test.Helpers._
import org.scalatest.matchers.ShouldMatchers
import org.scalatest.FlatSpec

class VideoControllerTest extends FlatSpec with ShouldMatchers {

  "Video Controller" should "200 when content type is video" in Fake {
    val result = controllers.VideoController.render("uk/video/2012/jun/26/queen-enniskillen-northern-ireland-video")(TestRequest())
    status(result) should be(200)
  }

  it should "internal redirect when content type is not video" in Fake {
    val result = controllers.VideoController.render("uk/2012/jun/27/queen-martin-mcguinness-shake-hands")(TestRequest())
    status(result) should be(200)
    header("X-Accel-Redirect", result).get should be("/type/article/uk/2012/jun/27/queen-martin-mcguinness-shake-hands")
  }

  it should "display an expired message for expired content" in Fake {
    val result = controllers.VideoController.render("world/video/2008/dec/11/guantanamo-bay")(TestRequest())
    status(result) should be(410)
    contentAsString(result) should include("Inside Guant&amp;aacute;namo")
    contentAsString(result) should include("This content has been removed as our copyright has expired.")
  }

}