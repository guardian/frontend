package test

import org.scalatest.{Matchers, FlatSpec, DoNotDiscover}
import play.api.test._
import play.api.test.Helpers._

@DoNotDiscover class FlyerControllerTest extends FlatSpec with Matchers with ConfiguredTestSuite  {

  val article = "/world/2014/nov/18/hereford-hospital-patient-tested-for-ebola"

  "Content Card Controller" should "200 when the content is found" in {
      val result = controllers.FlyerController.render(article)(TestRequest())
      status(result) should be(200)
  }

  it should "return JSON when .json format is supplied" in {
    val fakeRequest = FakeRequest(GET, s"/embed/card/${article}.json")
      .withHeaders("host" -> "localhost:9000")
      .withHeaders("Origin" -> "http://www.theorigin.com")

    val result = controllers.FlyerController.render(article)(fakeRequest)
    status(result) should be(200)
    contentType(result).get should be("application/json")
    contentAsString(result) should startWith("{\"html\"")
  }
}
