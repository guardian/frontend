package test

import org.scalatest.Matchers
import org.scalatest.FlatSpec
import play.api.test._
import play.api.test.Helpers._

class MostViewedGalleryTest extends FlatSpec with Matchers {

  "Most Viewed Gallery Controller" should "200" in Fake {
    val result = controllers.MostViewedGalleryController.renderMostViewed()(TestRequest())
    status(result) should be(200)
  }

  it should "return JSON when .json format is supplied" in Fake {
    val fakeRequest = FakeRequest(GET, s"/gallery/mostviewed.json")
      .withHeaders("host" -> "localhost:9000")
      .withHeaders("Origin" -> "http://www.theorigin.com")

    val result = controllers.MostViewedGalleryController.renderMostViewed()(fakeRequest)
    status(result) should be(200)
    contentType(result).get should be("application/json")
    contentAsString(result) should startWith("{\"html\"")
  }
}