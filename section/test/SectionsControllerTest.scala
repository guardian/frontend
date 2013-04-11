package test

import play.api.test._
import play.api.test.Helpers._
import org.scalatest.matchers.ShouldMatchers
import org.scalatest.FlatSpec

class SectionsControllerTest extends FlatSpec with ShouldMatchers {

  "Sections Controller" should "200 when content type is sections" in Fake {
    val result = controllers.SectionsController.render()(TestRequest())
    status(result) should be(200)
  }

  it should "return JSONP when callback is supplied" in Fake {
    val fakeRequest = FakeRequest(GET, "sections?callback=foo").withHeaders("host" -> "localhost:9000")
    val result = controllers.SectionsController.render()(fakeRequest)
    status(result) should be(200)
    header("Content-Type", result).get should be("application/javascript")
  }

}