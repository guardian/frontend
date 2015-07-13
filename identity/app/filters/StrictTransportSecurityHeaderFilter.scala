package filters

import common.ExecutionContexts
import play.api.mvc.{Result, RequestHeader, Filter}

import scala.concurrent.Future

object StrictTransportSecurityHeaderFilter extends Filter with ExecutionContexts {

  private val Header = "Strict-Transport-Security" -> "max-age=31536000; preload"

  override def apply(nextFilter: (RequestHeader) => Future[Result])(request: RequestHeader): Future[Result] = {
    nextFilter(request).map(_.withHeaders(Header))
  }
}
