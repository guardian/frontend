package test

import org.scalatest.matchers.ShouldMatchers
import org.scalatest.FlatSpec
import play.api.test._
import play.api.test.Helpers._
import play.api.mvc.AsyncResult

class MostPopularControllerTest extends FlatSpec with ShouldMatchers {

  "TMost Popular Controller" should "200 when content type is tag" in Fake {
    val result = controllers.MostPopularController.render("UK", "technology")(FakeRequest())
    status(await(result.asInstanceOf[AsyncResult].result)) should be(200)
  }
}