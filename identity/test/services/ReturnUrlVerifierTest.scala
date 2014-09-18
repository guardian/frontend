package services

import org.scalatest.{DoNotDiscover, FunSuite, Matchers}
import conf.IdentityConfiguration
import play.api.mvc.{AnyContentAsEmpty, AnyContentAsText, Request}
import play.api.test.{FakeHeaders, FakeRequest}
import test.ConfiguredTestSuite

@DoNotDiscover class ReturnUrlVerifierTest extends FunSuite with Matchers with ConfiguredTestSuite {

  val conf = new IdentityConfiguration

  val domain = conf.id.domain

  val validator = new ReturnUrlVerifier(conf)

  test("is valid if return url matches domain") {
    val returnUrl = "http://" + domain + "/dlfksadlkfjlakfdklj"
    validator.hasVerifiedReturnUrl(returnUrl) should equal(true)
    validator.getVerifiedReturnUrl(Some(returnUrl)) should equal(Some(returnUrl))
  }

  test("is valid if return url is on a subdomain of an allowed domain") {
    val returnUrl = "http://sub." + domain + "/dlfksadlkfjlakfdklj"
    validator.hasVerifiedReturnUrl(returnUrl) should equal(true)
    validator.getVerifiedReturnUrl(Some(returnUrl)) should equal(Some(returnUrl))
  }

  test("is valid if return url matches domain for https") {
    val returnUrl = "https://sub." + domain + "/dlfksadlkfjlakfdklj"
    validator.hasVerifiedReturnUrl(returnUrl) should equal(true)
    validator.getVerifiedReturnUrl(Some(returnUrl)) should equal(Some(returnUrl))
  }

  test("is invalid (should return None) if url doesn't match domain") {
    val returnUrl = "https://sub.invaliddomain.com/dlfksadlkfjlakfdklj"
    validator.hasVerifiedReturnUrl(returnUrl) should equal(false)
    validator.getVerifiedReturnUrl(Some(returnUrl)) should equal(None)
  }

  test("getVerifiedReturnUrl should return None if no url is provided") {
    validator.getVerifiedReturnUrl(None) should equal(None)
  }

  test("gets a valid returnUrl parameter from the request") {
    val request = new FakeRequest("GET", "http://example.com?returnUrl=http%3A%2F%2Fsub." + domain + "%2Ftest", FakeHeaders(), AnyContentAsEmpty)
    validator.getVerifiedReturnUrl(request) should equal(Some("http://sub." + domain + "/test"))
  }

  test("rejects an invalid returnUrl parameter from the request") {
    val request = new FakeRequest("GET", "http://example.com?returnUrl=http%3A%2F%2Fsub.invalid.com%2Ftest", FakeHeaders(), AnyContentAsEmpty)
    validator.getVerifiedReturnUrl(request) should equal(None)
  }

  test("does not allow script injection") {
    val returnUrl = "https://sub." + domain + "/dlfksa<script>"
    validator.hasVerifiedReturnUrl(returnUrl) should equal(false)
    validator.getVerifiedReturnUrl(Some(returnUrl)) should be (None)
  }
}
