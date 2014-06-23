package conf

import org.scalatest.{FlatSpec, Matchers}
import play.api.libs.iteratee.Enumerator
import play.api.mvc.{ResponseHeader, SimpleResult}
import test.TestRequest

import scala.concurrent.duration._
import scala.concurrent.{Await, Future}


class CorsVaryHeadersFilterTest extends FlatSpec with Matchers {

  private val header = TestRequest()

  "CorsVaryHeadersFilter" should "add appropriate Vary headers for CORS requests" in {
    val upstreamResult = buildResult("Access-Control-Allow-Headers" -> "something")
    val result = Await.result(CorsVaryHeadersFilter(r => upstreamResult)(header), 5.seconds)
    result.header.headers.get("Vary") should be (Some("Origin,Accept"))
  }

  it should "append the headers if there are already Vary headers" in {
    val upstreamResult = buildResult(
      "Access-Control-Allow-Headers" -> "something",
      "Vary" -> "Accept-Encoding"
    )
    val result = Await.result(CorsVaryHeadersFilter(r => upstreamResult)(header), 5.seconds)
    result.header.headers.get("Vary") should be (Some("Accept-Encoding,Origin,Accept"))
  }

  it should "not append the headers if it is not a CORS request" in {
    val upstreamResult = buildResult("Vary" -> "Accept-Encoding")
    val result = Await.result(CorsVaryHeadersFilter(r => upstreamResult)(header), 5.seconds)
    result.header.headers.get("Vary") should be (Some("Accept-Encoding"))
  }

  private def buildResult(headers: (String, String)*) =  Future.successful(
    SimpleResult(ResponseHeader( 200, headers.toMap), Enumerator.empty)
  )
}
