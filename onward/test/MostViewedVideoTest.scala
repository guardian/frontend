package test

import org.scalatest.{Matchers, FlatSpec}
import play.api.test.Helpers._

class MostViewedVideoTest extends FlatSpec with Matchers {

  "Most Viewed Video Controller" should "200 when content type is tag" in Fake {
    val result = controllers.MostViewedVideoController.renderMostViewed()(TestRequest())
    status(result) should be(200)
  }
}