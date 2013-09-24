package utils

import org.scalatest.FunSuite
import play.api.test.FakeRequest
import play.api.test.Helpers._
import org.scalatest.matchers.ShouldMatchers

class RemoteAddressTest extends FunSuite with ShouldMatchers {
  object TestRemoteAddress extends RemoteAddress

  val xFor = "X-Forwarded-For"
  def fakeRequest(xForHeader: String) = FakeRequest(GET, "uri").withHeaders(xFor -> xForHeader)

  test("extract a simple IP address") {
    TestRemoteAddress.clientIp(fakeRequest("123.456.789.012")) should equal(Some("123.456.789.012"))
    TestRemoteAddress.clientIp(fakeRequest("1.23.4.567")) should equal(Some("1.23.4.567"))
  }

  test("extract leftmost IP from X-Forwarded-For list") {
    TestRemoteAddress.clientIp(fakeRequest("123.456.789.012, 987.654.321.098")) should equal(Some("123.456.789.012"))
    TestRemoteAddress.clientIp(fakeRequest("123.456.789.012, 987.654.321.098, 1.2.3.4")) should equal(Some("123.456.789.012"))
  }

  test("skips internal IPs at left of list") {
    TestRemoteAddress.clientIp(fakeRequest("192.168.1.1, 123.456.789.012")) should equal(Some("123.456.789.012"))
    TestRemoteAddress.clientIp(fakeRequest("172.25.1.1, 123.456.789.012")) should equal(Some("123.456.789.012"))
    TestRemoteAddress.clientIp(fakeRequest("10.0.1.1, 123.456.789.012")) should equal(Some("123.456.789.012"))
  }

  test("extracts nothing from invalid header") {
    TestRemoteAddress.clientIp(fakeRequest("not an ip address")) should equal(None)
  }
}
