package test

import org.scalatest.{DoNotDiscover, Matchers, FlatSpec}
import play.api.test._
import play.api.test.Helpers._

@DoNotDiscover class MostPopularControllerTest extends FlatSpec with Matchers with ConfiguredTestSuite {

  val tag = "technology"

  "Most Popular Controller" should "200 when content type is tag" in {
    val result = controllers.MostPopularController.render(tag)(TestRequest())
    status(result) should be(200)
  }

  it should "return JSON when .json format is supplied" in {
    val fakeRequest = FakeRequest(GET, s"/most-read/${tag}.json")
      .withHeaders("host" -> "localhost:9000")
      .withHeaders("Origin" -> "http://www.theorigin.com")

    val result = controllers.MostPopularController.render(tag)(fakeRequest)
    status(result) should be(200)
    contentType(result).get should be("application/json")
    contentAsString(result) should startWith("{\"html\"")
  }

}
