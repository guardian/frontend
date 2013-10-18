package test

import play.api.test._
import play.api.test.Helpers._
import org.scalatest.Matchers
import org.scalatest.FlatSpec

class IndexControllerTest extends FlatSpec with Matchers {

  val section = "books"
  val callbackName = "aFunction"

  "Section Controller" should "200 when content type is front" in Fake {
    val result = controllers.IndexController.render(section)(TestRequest())
    status(result) should be(200)
  }

  it should "200 when it gets an editionalised path" in Fake {
    val result = controllers.IndexController.render("commentisfree/uk-edition")(TestRequest())
    status(result) should be(200)
  }

  it should "return JSONP when callback is supplied to front" in Fake {
    val fakeRequest = FakeRequest(GET, s"${section}?callback=$callbackName")
      .withHeaders("host" -> "localhost:9000")

    val result = controllers.IndexController.render(section)(fakeRequest)
    status(result) should be(200)
    header("Content-Type", result).get should be("application/javascript")
    contentAsString(result) should startWith(s"""${callbackName}({\"html\"""")
  }

  it should "return JSON when .json format is supplied to front" in Fake {
    val fakeRequest = FakeRequest(GET, s"${section}.json")
      .withHeaders("host" -> "localhost:9000")
      .withHeaders("Origin" -> "http://www.theorigin.com")

    val result = controllers.IndexController.render(section)(fakeRequest)
    status(result) should be(200)
    header("Content-Type", result).get should be("application/json")
    contentAsString(result) should startWith("{\"html\"")
  }

  it should "internal redirect when content type is not front" in Fake {
    val result = controllers.IndexController.render("world/video/2012/feb/10/inside-tibet-heart-protest-video")(TestRequest())
    status(result) should be(200)
    header("X-Accel-Redirect", result).get should be("/type/video/world/video/2012/feb/10/inside-tibet-heart-protest-video")
  }

  it should "200 when content type is front trails" in Fake {
    val result = controllers.IndexController.renderTrails(section)(TestRequest())
    status(result) should be(200)
  }

  it should "return JSONP when callback is supplied to front trails" in Fake {
    val fakeRequest = FakeRequest(GET, s"${section}/trails?callback=$callbackName")
      .withHeaders("host" -> "localhost:9000")

    val result = controllers.IndexController.renderTrails(section)(fakeRequest)
    status(result) should be(200)
    header("Content-Type", result).get should be("application/javascript")
    contentAsString(result) should startWith(s"""${callbackName}({\"html\"""")
  }

  it should "return JSON when .json format is supplied to front trails" in Fake {
    val fakeRequest = FakeRequest(GET, s"${section}/trails.json")
      .withHeaders("host" -> "localhost:9000")
      .withHeaders("Origin" -> "http://www.theorigin.com")

    val result = controllers.IndexController.renderTrails(section)(fakeRequest)
    status(result) should be(200)
    header("Content-Type", result).get should be("application/json")
    contentAsString(result) should startWith("{\"html\"")
  }

}
