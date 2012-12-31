package test

import play.api.test._
import play.api.test.Helpers._
import org.scalatest.matchers.ShouldMatchers
import org.scalatest.FlatSpec
import play.api.mvc.AsyncResult

class VideoControllerTest extends FlatSpec with ShouldMatchers {

  "Video Controller" should "200 when content type is video" in Fake {
    val result = controllers.VideoController.render("uk/video/2012/jun/26/queen-enniskillen-northern-ireland-video")(FakeRequest())
    status(await(result.asInstanceOf[AsyncResult].result)) should be(200)
  }

  it should "404 when content type is not video" in Fake {
    val result = controllers.VideoController.render("uk/2012/jun/27/queen-martin-mcguinness-shake-hands")(FakeRequest())
    status(await(result.asInstanceOf[AsyncResult].result)) should be(404)
  }
}