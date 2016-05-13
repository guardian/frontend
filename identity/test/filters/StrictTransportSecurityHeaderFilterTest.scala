package filters

import akka.stream.Materializer
import org.scalatest.{Matchers, FunSuite}
import org.scalatestplus.play.OneAppPerSuite
import play.api.mvc.{Result, RequestHeader}
import play.api.test.FakeRequest
import play.api.mvc.Results._

import scala.concurrent.{Await, Future}
import scala.concurrent.duration._

class StrictTransportSecurityHeaderFilterTest extends FunSuite with Matchers with OneAppPerSuite {
  implicit val mat: Materializer = app.materializer

  test("filter should add the strict-transport-security header") {
    val request = FakeRequest()
    def action(req: RequestHeader): Future[Result] = Future.successful(Ok)

    val result = new StrictTransportSecurityHeaderFilter().apply(action _)(request)

    Await.result(result, 1.second).header.headers("Strict-Transport-Security") should equal("max-age=31536000; preload")
  }

}
