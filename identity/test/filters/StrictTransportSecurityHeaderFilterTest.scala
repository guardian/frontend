package filters

import akka.stream.Materializer
import http.StrictTransportSecurityHeaderFilter
import org.scalatest.funsuite.AnyFunSuite
import org.scalatest.matchers.should.Matchers
import org.scalatest.DoNotDiscover
import play.api.mvc.{RequestHeader, Result}
import play.api.test.FakeRequest
import play.api.mvc.Results._
import test.{ConfiguredTestSuite, WithTestExecutionContext}

import scala.concurrent.{Await, Future}
import scala.concurrent.duration._

@DoNotDiscover class StrictTransportSecurityHeaderFilterTest
    extends AnyFunSuite
    with Matchers
    with ConfiguredTestSuite
    with WithTestExecutionContext {

  implicit lazy val mat: Materializer = app.materializer

  test("filter should add the strict-transport-security header") {
    val request = FakeRequest()
    def action(req: RequestHeader): Future[Result] = Future.successful(Ok)

    val result = new StrictTransportSecurityHeaderFilter().apply(action _)(request)

    Await.result(result, 1.second).header.headers("Strict-Transport-Security") should equal(
      "max-age=31536000; includeSubDomains; preload",
    )
  }

}
