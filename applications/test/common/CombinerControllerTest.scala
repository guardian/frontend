package common


import play.api.test.Helpers._
import org.scalatest.Matchers
import org.scalatest.FlatSpec
import test.{TestRequest, Fake}

class CombinerControllerTest extends FlatSpec with Matchers {
  "Combiner" should "404 when there is no content for 2 tags" in Fake {
    val result = controllers.IndexController.renderCombiner("profile/grant-klopper", "tone/reviews")(TestRequest())
    status(result) should be(404)
  }
}
