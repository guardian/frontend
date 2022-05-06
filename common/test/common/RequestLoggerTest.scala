package common

import common.LoggingField._
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers
import play.api.test.FakeRequest

class RequestLoggerTest extends AnyFlatSpec with Matchers {

  "RequestLogger with no request, response or stopwatch" should "have no fields" in {
    val fields = RequestLoggerFields(request = None, response = None, stopWatch = None)
    fields.toList should be(empty)
  }

  "RequestLogger with stopwatch" should "have latency field" in {
    val fields = RequestLoggerFields(request = None, response = None, stopWatch = Some(new StopWatch))
    fields.toList.exists(_.name == "req.latency_millis") should be(true)
  }

  "RequestLogger with request" should "log expected fields" in {
    val headers = List(
      ("X-GU-header1", "value1"),
      ("X-GU-header2", "value2"),
      ("Host", "someHost"),
      ("Referer", "someReferer"),
      ("NotSupported", "value"),
    )
    val req = FakeRequest("GET", "/some/path").withHeaders(headers: _*)
    val fields = RequestLoggerFields(request = Some(req), response = None, stopWatch = None)
    val expectedFields: List[LogField] = List(
      "req.method" -> "GET",
      "req.url" -> "/some/path",
      "req.header.X-GU-header1" -> "value1",
      "req.header.X-GU-header2" -> "value2",
      "req.header.Host" -> "someHost",
      "req.header.Referer" -> "someReferer",
      "action.controller" -> "unknown",
      "action.method" -> "unknown",
    )
    val notExpectedFields: List[LogField] = List("NotSupported" -> "value")
    expectedFields.forall(fields.toList.contains) should be(true)
    notExpectedFields.forall(fields.toList.contains) should be(false)
  }

  "RequestLogger with response" should "log expected fields" in {
    val fields = RequestLoggerFields(request = None, response = Some(Ok), stopWatch = None)
    val expectedFields: List[LogField] = List(
      "resp.status" -> 200,
    )
    expectedFields.forall(fields.toList.contains) should be(true)
  }
}
