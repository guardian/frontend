package common

import org.scalatest.FlatSpec
import org.scalatest.matchers.ShouldMatchers
import play.api.templates.Html
import play.api.test.{ FakeHeaders, FakeRequest }

class JsonComponentTest extends FlatSpec with ShouldMatchers {

  "JsonComponent" should "return NOT MODIFIED if etags are the same" in {
    val request = FakeRequest("GET", "http://foo.bar", FakeHeaders(Map("If-None-Match" -> Seq("1234"))), "")
    JsonComponent(Html("fooo"), Some("1234"))(request).header.status should be(304)
  }

  it should "return OK if etags are the not same" in {
    val request = FakeRequest("GET", "http://foo.bar", FakeHeaders(Map("If-None-Match" -> Seq("12345"))), "")
    JsonComponent(Html("fooo"), Some("1234"))(request).header.status should be(200)
  }

  it should "return OK if there is no etag sent by client" in {
    val request = FakeRequest("GET", "http://foo.bar", FakeHeaders(Map()), "")
    JsonComponent(Html("fooo"), Some("1234"))(request).header.status should be(200)
  }

  it should "return OK if there is no etag for this json" in {
    val request = FakeRequest("GET", "http://foo.bar", FakeHeaders(Map()), "")
    JsonComponent(Html("fooo"), None)(request).header.status should be(200)
  }

  it should "set the etag as a header if it is supplied" in {
    val request = FakeRequest("GET", "http://foo.bar", FakeHeaders(Map()), "")
    JsonComponent(Html("fooo"), Some("asdf"))(request).header.headers should contain("ETag" -> "asdf")
  }
}
