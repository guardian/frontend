package conf

import common.JsonComponent
import org.scalatest.{FlatSpec, Matchers}
import play.api.libs.iteratee.Enumerator
import play.api.mvc.{ResponseHeader, Result}
import play.api.test.FakeRequest
import play.twirl.api.Html
import test.TestRequest
import scala.concurrent.duration._
import scala.concurrent.{Await, Future}


class JsonHeadersFilterTest extends FlatSpec with Matchers {

  private val header = TestRequest("/foo.json")

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

  "CorsVaryHeadersFilter" should "add appropriate Vary headers for Json requests" in {
    val upstreamResult = buildResult("Access-Control-Allow-Headers" -> "something")
    val result = Await.result(JsonHeadersFilter(r => upstreamResult)(header), 5.seconds)
    result.header.headers.get("Vary") should be (Some("Origin,Accept"))
  }

  it should "append the headers if there are already Vary headers" in {
    val upstreamResult = buildResult(
      "Access-Control-Allow-Headers" -> "something",
      "Vary" -> "Accept-Encoding"
    )
    val result = Await.result(JsonHeadersFilter(r => upstreamResult)(header), 5.seconds)
    result.header.headers.get("Vary") should be (Some("Accept-Encoding,Origin,Accept"))
  }

  it should "not append the headers if it is not a Json request" in {
    val upstreamResult = buildResult("Vary" -> "Accept-Encoding")
    val result = Await.result(JsonHeadersFilter(r => upstreamResult)(TestRequest("/foo")), 5.seconds)
    result.header.headers.get("Vary") should be (Some("Accept-Encoding"))
  }

  private def buildResult(headers: (String, String)*) =  Future.successful(
    Result(ResponseHeader( 200, headers.toMap), Enumerator.empty)
  )
}
