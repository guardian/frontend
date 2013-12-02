package test

import play.api.test.Helpers._
import org.scalatest.Matchers
import org.scalatest.FlatSpec

class SectionsControllerTest extends FlatSpec with Matchers {

  val callbackName = "aFunction"

  "Sections Controller" should "200 when content type is sections" in Fake {
    val result = controllers.SectionsController.renderSections()(TestRequest("/sections"))
    status(result) should be(200)
  }

  it should "return JSONP when callback is supplied" in Fake {
    val fakeRequest = TestRequest(s"sections?callback=$callbackName")
      .withHeaders("host" -> "localhost:9000")

    val result = controllers.SectionsController.renderSections()(fakeRequest)
    status(result) should be(200)
    header("Content-Type", result).get should be("application/javascript; charset=utf-8")
    contentAsString(result) should startWith(s"""${callbackName}({\"config\"""")
  }

  it should "return JSON when .json format is supplied" in Fake {
    val fakeRequest = TestRequest("/sections.json")
      .withHeaders("host" -> "localhost:9000")
      .withHeaders("Origin" -> "http://www.theorigin.com")

    val result = controllers.SectionsController.renderSectionsJson()(fakeRequest)
    status(result) should be(200)
    header("Content-Type", result).get should be("application/json; charset=utf-8")
    contentAsString(result) should startWith("{\"config\"")
  }
}