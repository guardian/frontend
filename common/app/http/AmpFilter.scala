package http

import akka.stream.Materializer
import common.ExecutionContexts
import conf.Configuration
import play.api.mvc.{Filter, RequestHeader, Result}

import scala.concurrent.Future

class AmpFilter(implicit val mat: Materializer) extends Filter with ExecutionContexts with implicits.Requests {
  override def apply(nextFilter: (RequestHeader) => Future[Result])(request: RequestHeader): Future[Result] = {
    if (request.isAmp) {
      val exposeAmpHeader = "Access-Control-Expose-Headers" -> "AMP-Access-Control-Allow-Source-Origin"
      val ampHeader = "AMP-Access-Control-Allow-Source-Origin" -> Configuration.amp.baseUrl
      nextFilter(request).map(_.withHeaders(exposeAmpHeader, ampHeader))
    } else nextFilter(request)
  }
}
