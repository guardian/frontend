package common

import conf.CommonSwitches.AutoRefreshSwitch
import org.scalatest.FlatSpec
import play.api.test.FakeRequest
import play.api.templates.Html
import org.scalatest.matchers.ShouldMatchers
import play.api.test.Helpers._

class JsonComponentTest extends FlatSpec with ShouldMatchers {

  "JsonComponent" should "not allow script injection" in {
    val request = FakeRequest("GET", "http://foo.bar.com?callback=some<script>")
    (JsonComponent(Html("<html></html>"))(request)).header.status should be(403)
  }

  it should "build json output with standard name" in {
    val request = FakeRequest("GET", "http://foo.bar.com?callback=success_0")
    val result = JsonComponent(Html("hello world"))(request)
    contentType(result) should be(Some("application/javascript"))
    status(result) should be(200)
    contentAsString(result) should be("""success_0({"html":"hello world","refreshStatus":true});""")
  }

  it should "build json from multiple items" in {
    val request = FakeRequest("GET", "http://foo.bar.com?callback=callbackName3")
    val result = JsonComponent("text" -> Html("hello world"), "url" -> Html("http://foo.bar.com"))(request)
    contentType(result) should be(Some("application/javascript"))
    status(result) should be(200)
    contentAsString(result) should be("""callbackName3({"text":"hello world","url":"http://foo.bar.com","refreshStatus":true});""")
  }

  it should "disable refreshing if auto refresh switch is off" in {
    AutoRefreshSwitch.switchOff()
    val request = FakeRequest("GET", "http://foo.bar.com?callback=success")
    val result = JsonComponent(Html("hello world"))(request)
    contentAsString(result) should be("""success({"html":"hello world","refreshStatus":false});""")
  }
}
