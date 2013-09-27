package test

import controllers.InteractiveController
import org.scalatest.matchers.ShouldMatchers
import org.scalatest.FlatSpec
import play.api.test.Helpers._

class InteractiveControllerTest extends FlatSpec with ShouldMatchers {
  
  val interactiveUrl = "/world/interactive/2013/jun/27/julia-gillard-career-timeline"

  "Interactive Controller" should "200" in Fake {
    val result = InteractiveController.renderInteractive(interactiveUrl)(TestRequest())
    status(result) should be(200)
  }
}
