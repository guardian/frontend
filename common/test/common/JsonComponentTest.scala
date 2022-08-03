package common

import conf.switches.Switches.AutoRefreshSwitch
import org.scalatest.matchers.should.Matchers
import org.scalatest.flatspec.AnyFlatSpec
import play.twirl.api.Html
import play.api.test.FakeRequest
import play.api.test.Helpers._
import play.api.libs.json.Json._
import test.WithTestExecutionContext

import scala.concurrent.Future

class JsonComponentTest extends AnyFlatSpec with Matchers with WithTestExecutionContext {

  "JsonComponent" should "build json output with standard name" in {
    AutoRefreshSwitch.switchOn()

    val result = Future {
      val request = FakeRequest("GET", "http://foo.bar.com/data.json")
      JsonComponent(Html("hello world"))(request).result
    }

    contentType(result) should be(Some("application/json"))
    status(result) should be(200)
    contentAsString(result) should be("""{"html":"hello world","refreshStatus":true}""")
  }

  it should "build json from multiple items" in {
    AutoRefreshSwitch.switchOn()

    val result = Future {
      val request = FakeRequest("GET", "http://foo.bar.com/data.json")
      JsonComponent("text" -> Html("hello world"), "url" -> Html("http://foo.bar.com"))(request).result
    }

    contentType(result) should be(Some("application/json"))
    status(result) should be(200)
    contentAsString(result) should be("""{"text":"hello world","url":"http://foo.bar.com","refreshStatus":true}""")
  }

  it should "render booleans properly" in {
    AutoRefreshSwitch.switchOn()

    val result = Future {
      val request = FakeRequest("GET", "http://foo.bar.com/data.json")
      JsonComponent("text" -> Html("hello world"), "url" -> Html("http://foo.bar.com"), "refresh" -> false)(
        request,
      ).result
    }

    contentType(result) should be(Some("application/json"))
    status(result) should be(200)
    contentAsString(result) should be(
      """{"text":"hello world","url":"http://foo.bar.com","refresh":false,"refreshStatus":true}""",
    )
  }

  it should "render a json object properly" in {
    AutoRefreshSwitch.switchOn()

    val result = Future {
      implicit val request = FakeRequest("GET", "http://foo.bar.com/data.json")
      JsonComponent.fromWritable(JsonComponent.withRefreshStatus(obj("name" -> "foo"))).result
    }

    contentType(result) should be(Some("application/json"))
    status(result) should be(200)
    contentAsString(result) should be("""{"name":"foo","refreshStatus":true}""")
  }

  it should "disable refreshing if auto refresh switch is off" in {
    AutoRefreshSwitch.switchOff()

    val result = Future {
      val request = FakeRequest("GET", "http://foo.bar.com/data.json")
      JsonComponent(Html("hello world"))(request).result
    }

    contentAsString(result) should be("""{"html":"hello world","refreshStatus":false}""")
  }
}
