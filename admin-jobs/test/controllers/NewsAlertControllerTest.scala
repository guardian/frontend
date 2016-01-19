package controllers

import org.scalatest.{DoNotDiscover, FlatSpec, Matchers}
import play.api.mvc.Result
import play.api.test.Helpers._
import play.api.test.FakeRequest
import test.ConfiguredTestSuite

@DoNotDiscover class NewsAlertControllerTest extends FlatSpec with Matchers with ConfiguredTestSuite {

  "alerts" should "200" in {
    val result = NewsAlertController.alerts()(FakeRequest())
    status(result) should be(200)
  }

}
