package test

import play.api.test._
import play.api.test.Helpers._
import org.scalatest.matchers.ShouldMatchers
import org.scalatest.FlatSpec

class InteractiveControllerTest extends FlatSpec with ShouldMatchers {
  
  val articleUrl = "/world/interactive/2013/jun/27/julia-gillard-career-timeline"

  "Interactive Controller" should "200" in Fake {
    val result = controllers.InteractiveController.render(articleUrl)(TestRequest())
    status(result) should be(200)
  }

}
