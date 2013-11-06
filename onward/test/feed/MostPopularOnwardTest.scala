package test

import play.api.test.Helpers._
import org.scalatest.Matchers
import org.scalatest.FlatSpec

class MostPopularOnwardTest extends FlatSpec with Matchers {

  "Popular Onward" should "should return 200" in Fake {
    val result = controllers.MostPopularOnwardController.render("anyPath")(TestRequest())
    status(result) should be(200)
  }

  it should "always return JSON" in Fake {
    val result = controllers.MostPopularOnwardController.render("anyPath")(TestRequest())
    status(result) should be(200)
    contentType(result).get should be("application/json")
    contentAsString(result) should startWith("{\"popularity\"")
  }
}
