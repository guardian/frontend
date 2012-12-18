package test

import org.scalatest.matchers.ShouldMatchers
import org.scalatest.FlatSpec
import play.api.test._
import play.api.test.Helpers._

class MostPopularControllerTest extends FlatSpec with ShouldMatchers {

  "TMost Popular Controller" should "200 when content type is tag" in Fake {
    val result = controllers.MostPopularController.render("technology")(FakeRequest())
    status(result) should be(200)
  }
}