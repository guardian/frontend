package test

import play.api.test._
import play.api.test.Helpers._
import org.scalatest.Matchers
import org.scalatest.FlatSpec
import common.UsesElasticSearch

class IndexControllerTest extends FlatSpec with Matchers with UsesElasticSearch {

  val section = "books"
  val callbackName = "aFunction"

  "Index Controller" should "200 when content type is front" in Fake {
    val result = controllers.IndexController.render(section)(TestRequest(s"/$section"))
    status(result) should be(200)
  }

  it should "return JSONP when callback is supplied to front" in Fake {
    val fakeRequest = TestRequest(s"/${section}?callback=$callbackName")
      .withHeaders("host" -> "localhost:9000")

    val result = controllers.IndexController.render(section)(fakeRequest)
    status(result) should be(200)
    header("Content-Type", result).get should be("application/javascript")
    contentAsString(result) should startWith(s"""${callbackName}({\"html\"""")
  }

  it should "return JSON when .json format is supplied to front" in Fake {
    val fakeRequest = TestRequest(s"/${section}.json")
      .withHeaders("host" -> "localhost:9000")
      .withHeaders("Origin" -> "http://www.theorigin.com")

    val result = controllers.IndexController.render(section)(fakeRequest)
    status(result) should be(200)
    header("Content-Type", result).get should be("application/json")
    contentAsString(result) should startWith("{\"html\"")
  }

  it should "internal redirect when content type is not front" in Fake {
    val result = controllers.IndexController.render("world/video/2012/feb/10/inside-tibet-heart-protest-video")(TestRequest("/world/video/2012/feb/10/inside-tibet-heart-protest-video"))
    status(result) should be(200)
    header("X-Accel-Redirect", result).get should be("/type/video/world/video/2012/feb/10/inside-tibet-heart-protest-video")
  }

  it should "200 when content type is front trails" in Fake {
    val result = controllers.IndexController.renderTrails(section)(TestRequest(s"/$section"))
    status(result) should be(200)
  }

  it should "redirect when content api says it is on the wrong web url" in Fake {

    val result = controllers.IndexController.render("type/video")(TestRequest("/type/video"))

    status(result) should be (302)
    header("Location", result).get should be ("/video")
  }

  it should "correctly redirect short urls to other servers" in Fake {

    val result = controllers.IndexController.render("p/3jdag")(TestRequest("/p/3jdag"))

    status(result) should be (302)
    header("Location", result).get should be ("/music/2013/oct/11/david-byrne-internet-content-world")
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
