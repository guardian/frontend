package common


import play.api.test.Helpers._
import org.scalatest.matchers.ShouldMatchers
import org.scalatest.FlatSpec
import test.{TestRequest, Fake}

class CombinerControllerTest extends FlatSpec with ShouldMatchers {
  "Combiner" should "404 when there is no content for 2 tags" in Fake {
    val result = controllers.IndexController.renderCombiner("profile/grant-klopper", "tone/reviews")(TestRequest())
    status(result) should be(404)
  }
}
