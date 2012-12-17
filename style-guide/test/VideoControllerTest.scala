package test

import play.api.test._
import play.api.test.Helpers._
import org.scalatest.matchers.ShouldMatchers
import org.scalatest.FlatSpec

class StyleGuideControllerTest extends FlatSpec with ShouldMatchers {

  "Style-guide Controller" should "200 when content type is style-guide" in Fake {
    val result = controllers.StyleGuideController.render("/style-guide")(FakeRequest())
    status(result) should be(200)
  }

  it should "404 when content type is not video" in Fake {
    val result = controllers.StyleGuideController.render("uk/2012/jun/27/queen-martin-mcguinness-shake-hands")(FakeRequest())
    status(result) should be(404)
  }
}