package http

import common.{GuLogging}
import org.apache.pekko.stream.Materializer
import play.api.mvc.{Filter, RequestHeader, Result}

import java.util.UUID
import scala.concurrent.{ExecutionContext, Future}

class RequestIdFilter(implicit val mat: Materializer, executionContext: ExecutionContext)
    extends Filter
    with GuLogging {

  override def apply(next: RequestHeader => Future[Result])(rh: RequestHeader): Future[Result] = {
    val headerKey = "x-request-id"
    // Play Framework's Headers.get(key) does a case-insensitive lookup
    val updatedRequest =
      if (rh.headers.get(headerKey).isEmpty) {
        rh.withHeaders(rh.headers.add(headerKey -> UUID.randomUUID().toString))
      } else {
        rh
      }
    next(updatedRequest)
  }
}
