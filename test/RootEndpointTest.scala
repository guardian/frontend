package test

import play.api.test._
import play.api.test.Helpers._
import org.scalatest.FlatSpec
import org.scalatest.matchers.ShouldMatchers

class RootEndpointTest extends FlatSpec with ShouldMatchers {

  "/" should "serve a 200" in {
    val result = routeAndCall(FakeRequest(GET, "/"))

    result should be('defined)
    status(result.get) should be(OK)
  }
}