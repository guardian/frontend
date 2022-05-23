package model

import org.scalatest.matchers.should.Matchers
import play.api.mvc.AnyContentAsEmpty
import play.api.mvc.Results.NoContent
import play.api.test.{FakeHeaders, FakeRequest}
import play.api.test.Helpers._
import model.Cors.isWhitelisted
import org.scalatest.flatspec.AnyFlatSpec

class CorsTest extends AnyFlatSpec with Matchers {
  "Cors Helper" should "not provide Cors response headers for unsupported origins" in {
    // This test is here to show that we really do accept any origin outside of the whitelist. We should change this policy.
    val fakeHeaders = FakeHeaders(List("Origin" -> "unknown.origin.com"))
    val fakeRequest = FakeRequest(POST, "/css", fakeHeaders, AnyContentAsEmpty)
    Cors(NoContent)(fakeRequest).header.headers.get("Access-Control-Allow-Origin") shouldBe None
    Cors(NoContent)(fakeRequest).header.headers.get("Access-Control-Allow-Credentials") shouldBe None
    Cors(NoContent)(fakeRequest).header.headers.get("Access-Control-Allow-Headers") shouldBe None
  }

  it should "provide the appropriate standard Cors response headers with an accepted Origin" in {
    val fakeHeaders = FakeHeaders(List("Origin" -> "http://www.random.com"))
    val fakeRequest = FakeRequest(POST, "/css", fakeHeaders, AnyContentAsEmpty)
    Cors(NoContent)(fakeRequest).header.headers should contain("Access-Control-Allow-Origin" -> "http://www.random.com")
  }

  it should "not provide Cors response headers if the request has no Origin" in {
    val fakeHeaders = FakeHeaders(Nil)
    val fakeRequest = FakeRequest(POST, "/css", fakeHeaders, AnyContentAsEmpty)
    Cors(NoContent)(fakeRequest).header.headers.get("Access-Control-Allow-Origin") shouldBe None
    Cors(NoContent)(fakeRequest).header.headers.get("Access-Control-Allow-Credentials") shouldBe None
    Cors(NoContent)(fakeRequest).header.headers.get("Access-Control-Allow-Headers") shouldBe None
  }

  it should "provide Cors response with allowed methods" in {
    val fakeHeaders = FakeHeaders(List("Origin" -> "http://www.random.com"))
    val fakeRequest = FakeRequest(POST, "/css", fakeHeaders, AnyContentAsEmpty)
    Cors(NoContent, Some("OPTIONS, POST, GET"))(fakeRequest).header.headers should contain(
      "Access-Control-Allow-Methods" -> "OPTIONS, POST, GET",
    )
  }

  it should "provide Cors response with allowed headers" in {
    val fakeHeaders =
      FakeHeaders(List("Origin" -> "http://www.random.com", "Access-Control-Request-Headers" -> "X-GU-test"))
    val fakeRequest = FakeRequest(POST, "/css", fakeHeaders, AnyContentAsEmpty)
    Cors(NoContent)(fakeRequest).header.headers should contain(
      "Access-Control-Allow-Headers" -> "X-Requested-With,Origin,Accept,Content-Type,X-GU-test",
    )
  }

  val validDomain = "theguardian.com"
  val validSubDomain = s"manage.$validDomain"

  "isWhitelisted" should "return true if the origin exists in corsOrigins" in {
    isWhitelisted(s"https://$validSubDomain", Seq(s"https://$validSubDomain"), Seq.empty) shouldBe true
  }

  it should "return true if the origin domain is localhost and localhost is in domainWhitelist" in {
    isWhitelisted("http://localhost", Seq.empty, Seq("localhost")) shouldBe true
  }

  it should "return true if the origin domain is an exact match of a domain in domainWhitelist" in {
    isWhitelisted(s"https://$validDomain", Seq.empty, Seq(validDomain)) shouldBe true
  }

  it should "return true if the origin domain is a subdomain of a domain in domainWhitelist" in {
    isWhitelisted(s"https://$validSubDomain", Seq.empty, Seq(validDomain)) shouldBe true
  }

  it should "return false if the origin isn't in corsOrigin and isn't a domain in domainWhitelist or any of its subdomains" in {
    isWhitelisted("https://example.com", Seq.empty, Seq(validDomain)) shouldBe false
  }

  it should "return false if the origin is a subdomain of localhost even if localhost is in domainWhitelist" in {
    isWhitelisted("http://test.localhost", Seq.empty, Seq("localhost")) shouldBe false
  }

  it should "return false if the origin ends with something in domainWhitelist" in {
    isWhitelisted(s"https://exampletheguardian.com", Seq.empty, Seq("theguardian.com")) shouldBe false
  }

  it should "return true if the origin domain is an exact match of a domain in domainWhitelist regardless of the protocol" in {
    isWhitelisted(s"http://$validDomain", Seq.empty, Seq(validDomain)) shouldBe true
    isWhitelisted(s"https://$validDomain", Seq.empty, Seq(validDomain)) shouldBe true
  }

  it should "return true if the origin domain is localhost and localhost is in domainWhitelist regardless of the port" in {
    isWhitelisted("http://localhost:3000", Seq.empty, Seq("localhost")) shouldBe true
    isWhitelisted("http://localhost:9000", Seq.empty, Seq("localhost")) shouldBe true
  }
}
