package http

import akka.stream.Materializer
import play.api.mvc.{Filter, RequestHeader, Result}

import scala.concurrent.{ExecutionContext, Future}

class StrictTransportSecurityHeaderFilter(implicit val mat: Materializer, executionContext: ExecutionContext) extends Filter {

  private val OneYearInSeconds = 31536000
  private val Header = "Strict-Transport-Security" -> s"max-age=$OneYearInSeconds; includeSubDomains; preload"

  override def apply(nextFilter: (RequestHeader) => Future[Result])(request: RequestHeader): Future[Result] = {
    nextFilter(request).map(_.withHeaders(Header))
  }
}
