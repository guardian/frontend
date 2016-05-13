package filters

import akka.stream.Materializer
import common.ExecutionContexts
import play.api.mvc.{Filter, RequestHeader, Result}

import scala.concurrent.Future

class StrictTransportSecurityHeaderFilter(implicit val mat: Materializer) extends Filter with ExecutionContexts {

  private val OneYearInSeconds = 31536000
  private val Header = "Strict-Transport-Security" -> s"max-age=$OneYearInSeconds; preload"

  override def apply(nextFilter: (RequestHeader) => Future[Result])(request: RequestHeader): Future[Result] = {
    nextFilter(request).map(_.withHeaders(Header))
  }
}
