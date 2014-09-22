package common

import play.api.test.Helpers._
import org.scalatest.{DoNotDiscover, Matchers, FlatSpec}
import test.{ConfiguredTestSuite, TestRequest}

@DoNotDiscover class CombinerControllerTest extends FlatSpec with Matchers with ConfiguredTestSuite {
  "Combiner" should "404 when there is no content for 2 tags" in {
    val result = controllers.IndexController.renderCombiner("profile/grant-klopper", "tone/reviews")(TestRequest())
    status(result) should be(404)
  }
}
