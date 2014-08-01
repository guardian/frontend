package conf

import org.scalatest.{FlatSpec, Matchers}
import play.api.libs.iteratee.Enumerator
import play.api.mvc.{ResponseHeader, Result}
import test.TestRequest

import scala.concurrent.duration._
import scala.concurrent.{Await, Future}


class JsonVaryHeadersFilterTest extends FlatSpec with Matchers {

  private val header = TestRequest("/foo.json")

  "CorsVaryHeadersFilter" should "add appropriate Vary headers for Json requests" in {
    val upstreamResult = buildResult("Access-Control-Allow-Headers" -> "something")
    val result = Await.result(JsonVaryHeadersFilter(r => upstreamResult)(header), 5.seconds)
    result.header.headers.get("Vary") should be (Some("Origin,Accept"))
  }

  it should "append the headers if there are already Vary headers" in {
    val upstreamResult = buildResult(
      "Access-Control-Allow-Headers" -> "something",
      "Vary" -> "Accept-Encoding"
    )
    val result = Await.result(JsonVaryHeadersFilter(r => upstreamResult)(header), 5.seconds)
    result.header.headers.get("Vary") should be (Some("Accept-Encoding,Origin,Accept"))
  }

  it should "not append the headers if it is not a Json request" in {
    val upstreamResult = buildResult("Vary" -> "Accept-Encoding")
    val result = Await.result(JsonVaryHeadersFilter(r => upstreamResult)(TestRequest("/foo")), 5.seconds)
    result.header.headers.get("Vary") should be (Some("Accept-Encoding"))
  }

  private def buildResult(headers: (String, String)*) =  Future.successful(
    Result(ResponseHeader( 200, headers.toMap), Enumerator.empty)
  )
}
