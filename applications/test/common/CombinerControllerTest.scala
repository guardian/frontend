package common

import controllers.IndexController
import play.api.test.Helpers._
import org.scalatest.{DoNotDiscover, Matchers, FlatSpec}
import test.{ConfiguredTestSuite, TestRequest}

@DoNotDiscover class CombinerControllerTest extends FlatSpec with Matchers with ConfiguredTestSuite {
  val indexController = new IndexController
  "Combiner" should "404 when there is no content for 2 tags" in {
    val result = indexController.renderCombiner("profile/grant-klopper", "tone/reviews")(TestRequest())
    status(result) should be(404)
  }
  "Combiner" should "404 when one or both tags are missing" in {
    val result = indexController.renderCombiner("commentisfree/commentisfree", "world/australia")(TestRequest())
    status(result) should be(404)
  }
}
