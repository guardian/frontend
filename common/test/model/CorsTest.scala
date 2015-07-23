package model

import org.scalatest.{Matchers, FlatSpec}
import play.api.mvc.AnyContentAsEmpty
import play.api.mvc.Results.NoContent
import play.api.test.{FakeHeaders, FakeRequest}
import play.api.test.Helpers._

class CorsTest extends FlatSpec with Matchers {
  "Cors Helper" should "provide the appropriate standard Cors response headers with any Origin" in {
    // This test is here to show that we really do accept any origin outside of the whitelist. We should change this policy.
    val fakeHeaders = FakeHeaders(List("Origin" -> "unknown.origin.com"))
    val fakeRequest = FakeRequest(POST, "/css", fakeHeaders, AnyContentAsEmpty)
    Cors(NoContent)(fakeRequest).header.headers should contain ("Access-Control-Allow-Origin" -> "*")
    Cors(NoContent)(fakeRequest).header.headers should contain ("Access-Control-Allow-Credentials" -> "true")
    Cors(NoContent)(fakeRequest).header.headers should contain ("Access-Control-Allow-Headers" -> "X-Requested-With,Origin,Accept,Content-Type")
  }

  it should "provide the appropriate standard Cors response headers with an accepted Origin" in {
    val fakeHeaders = FakeHeaders(List("Origin" -> "http://www.random.com"))
    val fakeRequest = FakeRequest(POST, "/css", fakeHeaders, AnyContentAsEmpty)
    Cors(NoContent)(fakeRequest).header.headers should contain ("Access-Control-Allow-Origin" -> "http://www.random.com")
  }

  it should "not provide Cors response headers if the request has no Origin" in {
    val fakeHeaders = FakeHeaders(Nil)
    val fakeRequest = FakeRequest(POST, "/css", fakeHeaders, AnyContentAsEmpty)
    Cors(NoContent)(fakeRequest).header.headers should not contain ("Access-Control-Allow-Origin" -> "*")
    Cors(NoContent)(fakeRequest).header.headers should not contain ("Access-Control-Allow-Credentials" -> "true")
    Cors(NoContent)(fakeRequest).header.headers should not contain ("Access-Control-Allow-Headers" -> "X-Requested-With,Origin,Accept,Content-Type")
  }

  it should "provide Cors response with allowed methods" in {
    val fakeHeaders = FakeHeaders(List("Origin" -> "http://www.random.com"))
    val fakeRequest = FakeRequest(POST, "/css", fakeHeaders, AnyContentAsEmpty)
    Cors(NoContent,Some("OPTIONS, POST, GET"))(fakeRequest).header.headers should contain("Access-Control-Allow-Methods" -> "OPTIONS, POST, GET")
  }

  it should "provide Cors response with allowed headers" in {
    val fakeHeaders = FakeHeaders(List("Origin" -> "http://www.random.com",
                                       "Access-Control-Request-Headers" -> "X-GU-test"))
    val fakeRequest = FakeRequest(POST, "/css", fakeHeaders, AnyContentAsEmpty)
    Cors(NoContent)(fakeRequest).header.headers should contain ("Access-Control-Allow-Headers" -> "X-Requested-With,Origin,Accept,Content-Type,X-GU-test")
  }
}
