package test

import play.api.test._
import play.api.test.Helpers._
import org.scalatest.matchers.ShouldMatchers
import org.scalatest.FlatSpec

class FrontControllerTest extends FlatSpec with ShouldMatchers {

  "Front Controller" should "200 called" in Fake {
    val result = controllers.FrontController.render()(FakeRequest())
    status(result) should be(200)
  }
}