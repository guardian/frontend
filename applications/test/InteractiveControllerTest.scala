package test

import controllers.InteractiveController
import play.api.test.Helpers._
import org.scalatest.{DoNotDiscover, Matchers, FlatSpec}
import scala.collection.JavaConversions._

@DoNotDiscover class InteractiveControllerTest extends FlatSpec with Matchers with ConfiguredTestSuite {

  val url = "lifeandstyle/ng-interactive/2016/mar/12/stephen-collins-cats-cartoon"
  val interactiveController = new InteractiveController

  "Interactive Controller" should "200 when content type is 'interactive'" in {
    val result = interactiveController.renderInteractive(url)(TestRequest(url))
    status(result) should be(200)
  }
}
