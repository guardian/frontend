package test

import org.scalatest.{DoNotDiscover, Matchers, FlatSpec}
import play.api.test.Helpers._

@DoNotDiscover class MostViewedVideoTest extends FlatSpec with Matchers with ConfiguredTestSuite {

  "Most Viewed Video Controller" should "200 when content type is tag" in {
    val result = controllers.MostViewedVideoController.renderMostViewed()(TestRequest())
    status(result) should be(200)
  }
}