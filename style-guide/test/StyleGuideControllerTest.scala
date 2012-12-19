package test

import play.api.test._
import play.api.test.Helpers._
import org.scalatest.matchers.ShouldMatchers
import org.scalatest.FlatSpec

class StyleGuideControllerTest extends FlatSpec with ShouldMatchers {

  "Style-guide Controller" should "200 when content type is style-guide" in Fake {
    val result = controllers.StyleGuideController.renderIndex()(FakeRequest("GET", "/style-guide"))
    status(result) should be(200)
  }
}