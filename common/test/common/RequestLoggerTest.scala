package common

import common.LoggingField._
import org.scalatest.{FlatSpec, Matchers}
import play.api.test.FakeRequest

class RequestLoggerTest extends FlatSpec with Matchers {

  "RequestLogger" should "log expected fields" in {
    val headers = List(
      ("X-GU-header1", "value1"),
      ("X-GU-header2", "value2"),
      ("Host", "someHost"),
      ("Referer", "someReferer"),
      ("NotSupported", "value")
    )
    val req = FakeRequest("GET", "/some/path").withHeaders(headers:_*)
    implicit val stopWatch = new StopWatch
    val logger = RequestLogger(req)
    val expectedFields: List[LogField] = List(
      "req.method" -> "GET",
      "req.url" -> "/some/path",
      "req.header.X-GU-header1" -> "value1",
      "req.header.X-GU-header2" -> "value2",
      "req.header.Host" -> "someHost",
      "req.header.Referer" -> "someReferer"
    )
    val notExpectedFields: List[LogField] = List("NotSupported" -> "value")
    expectedFields.forall(logger.allFields.contains) should be(true)
    notExpectedFields.forall(logger.allFields.contains) should be(false)
  }
}
