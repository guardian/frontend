package test

import play.api.test._
import play.api.test.Helpers._
import org.scalatest.Matchers
import org.scalatest.FlatSpec

class SectionsControllerTest extends FlatSpec with Matchers {

  val callbackName = "aFunction"

  "Sections Controller" should "200 when content type is sections" in Fake {
    val result = controllers.SectionsController.renderSections()(TestRequest())
    status(result) should be(200)
  }

  it should "return JSONP when callback is supplied" in Fake {
    val fakeRequest = FakeRequest(GET, s"sections?callback=$callbackName")
      .withHeaders("host" -> "localhost:9000")

    val result = controllers.SectionsController.renderSections()(fakeRequest)
    status(result) should be(200)
    header("Content-Type", result).get should be("application/javascript")
    contentAsString(result) should startWith(s"""${callbackName}({\"config\"""")
  }

  it should "return JSON when .json format is supplied" in Fake {
    val fakeRequest = FakeRequest(GET, "sections.json")
      .withHeaders("host" -> "localhost:9000")
      .withHeaders("Origin" -> "http://www.theorigin.com")

    val result = controllers.SectionsController.renderSectionsJson()(fakeRequest)
    status(result) should be(200)
    header("Content-Type", result).get should be("application/json")
    contentAsString(result) should startWith("{\"config\"")
  }
}