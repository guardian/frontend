package common

import conf.Switches.AutoRefreshSwitch
import org.scalatest.FlatSpec
import org.scalatest.Matchers
import play.api.templates.Html
import play.api.test.FakeRequest
import play.api.test.Helpers._
import play.api.libs.json.Json._
import scala.concurrent.Future

class JsonComponentTest extends FlatSpec with Matchers with ExecutionContexts {

  "JsonComponent" should "not allow script injection" in {
    val request = FakeRequest("GET", "http://foo.bar.com?callback=some<script>")
    (JsonComponent(Html("<html></html>"))(request)).header.status should be(403)
  }

  it should "build json output with standard name" in {
    AutoRefreshSwitch.switchOn()

    val result = Future {
      val request = FakeRequest("GET", "http://foo.bar.com?callback=success_0")
      JsonComponent(Html("hello world"))(request)
    }

    contentType(result) should be(Some("application/javascript"))
    status(result) should be(200)
    contentAsString(result) should be("""success_0({"html":"hello world","refreshStatus":true});""")
  }

  it should "build json from multiple items" in {
    AutoRefreshSwitch.switchOn()

    val result = Future {
      val request = FakeRequest("GET", "http://foo.bar.com?callback=callbackName3")
      JsonComponent("text" -> Html("hello world"), "url" -> Html("http://foo.bar.com"))(request)
    }

    contentType(result) should be(Some("application/javascript"))
    status(result) should be(200)
    contentAsString(result) should be("""callbackName3({"text":"hello world","url":"http://foo.bar.com","refreshStatus":true});""")
  }

  it should "render booleans properly" in {
    AutoRefreshSwitch.switchOn()

    val result = Future {
      val request = FakeRequest("GET", "http://foo.bar.com?callback=callbackName3")
      JsonComponent("text" -> Html("hello world"), "url" -> Html("http://foo.bar.com"), "refresh" -> false)(request)
    }

    contentType(result) should be(Some("application/javascript"))
    status(result) should be(200)
    contentAsString(result) should be("""callbackName3({"text":"hello world","url":"http://foo.bar.com","refresh":false,"refreshStatus":true});""")
  }

  it should "render a json object properly" in {
    AutoRefreshSwitch.switchOn()

    val result = Future {
      val request = FakeRequest("GET", "http://foo.bar.com?callback=callbackName3")
      JsonComponent(obj("name" -> "foo"))(request)
    }

    contentType(result) should be(Some("application/javascript"))
    status(result) should be(200)
    contentAsString(result) should be("""callbackName3({"name":"foo","refreshStatus":true});""")
  }

  it should "Vary on Accept and Origin" in {
    val result = Future {
      val request = FakeRequest("GET", "http://foo.bar.com?callback=callbackName3")
      JsonComponent(obj("name" -> "foo"))(request)
    }

    status(result) should be(200)
    println(headers(result))
    header("Vary", result) should be (Some("Accept, Origin"))
  }

  it should "disable refreshing if auto refresh switch is off" in {
    AutoRefreshSwitch.switchOff()

    val result = Future {
      val request = FakeRequest("GET", "http://foo.bar.com?callback=success")
      JsonComponent(Html("hello world"))(request)
    }

    contentAsString(result) should be("""success({"html":"hello world","refreshStatus":false});""")
  }

  it should "add the cross origin headers" in {

    val request = FakeRequest("GET", "http://foo.bar.com/test.json")
      .withHeaders("Host" -> "foo.bar.com")
      .withHeaders("Accept" -> "application/json")
      .withHeaders("Origin" -> "http://www.theorigin.com")
    val result = JsonComponent(Html("<p>hello</p>"))(request)

    result.header.headers.get("Access-Control-Allow-Origin") should be (Some("*"))
    result.header.headers.get("Access-Control-Allow-Origin") should be (Some("*"))
    result.header.headers.get("Access-Control-Allow-Headers") should be (Some("GET,POST,X-Requested-With"))
  }
}
