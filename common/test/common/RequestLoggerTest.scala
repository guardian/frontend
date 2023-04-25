package common

import common.LoggingField._
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers
import play.api.test.FakeRequest

class RequestLoggerTest extends AnyFlatSpec with Matchers {

  private val baseRequest: FakeRequest[_] = FakeRequest("GET", "/some/path")

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
    val req = baseRequest.withHeaders(headers: _*)
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

  "RequestLogger with request" should "tolerate case-insensitive HTTP headers names, outputting standard case regardless" in {
    def loggedFieldsFor(headers: (String, String)*) =
      RequestLoggerFields(
        request = Some(baseRequest.withHeaders(headers: _*)),
        response = None,
        stopWatch = None,
      ).toList

    // It's crucial that the Kibana field is named with consistent case, otherwise it will become many fields!
    val logfieldWithStandardCase = LogFieldString("req.header.User-Agent", "Example-UA")
    loggedFieldsFor("User-Agent" -> "Example-UA") should contain(logfieldWithStandardCase)
    loggedFieldsFor("User-agent" -> "Example-UA") should contain(logfieldWithStandardCase)
    loggedFieldsFor("user-agent" -> "Example-UA") should contain(logfieldWithStandardCase)
    loggedFieldsFor("USER-AGENT" -> "Example-UA") should contain(logfieldWithStandardCase)
  }

  "RequestLogger with response" should "log expected fields" in {
    val fields = RequestLoggerFields(request = None, response = Some(Ok), stopWatch = None)
    val expectedFields: List[LogField] = List(
      "resp.status" -> 200,
    )
    expectedFields.forall(fields.toList.contains) should be(true)
  }

  "RequestLogger with response" should "tolerate case-insensitive HTTP headers names" in {
    val fields =
      RequestLoggerFields(request = None, response = Some(Ok.withHeaders("vary" -> "example")), stopWatch = None)
    fields.toList should contain(LogFieldString("resp.Vary", "example"))
  }
}
