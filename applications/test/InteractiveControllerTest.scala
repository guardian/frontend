package test

import play.api.test._
import play.api.test.Helpers._
import org.scalatest.Matchers
import org.scalatest.FlatSpec

class InteractiveControllerTest extends FlatSpec with Matchers {
 
  val url = "/music/interactive/2013/aug/20/matthew-herbert-quiz-hearing"

  "Interactive Controller" should "200 when content type is 'interactive'" in Fake {
    val result = controllers.InteractiveController.renderInteractive(url)(TestRequest(url))
    status(result) should be(200)
  }
}
