package http

import org.apache.pekko.stream.Materializer
import play.api.mvc.{Filter, RequestHeader, Result}

import scala.concurrent.{ExecutionContext, Future}

// OBVIOUSLY this is only for the preview server
// NOT to be used elsewhere...
class PreviewNoCacheFilter(implicit val mat: Materializer, executionContext: ExecutionContext) extends Filter {
  override def apply(nextFilter: (RequestHeader) => Future[Result])(request: RequestHeader): Future[Result] =
    nextFilter(request).map(_.withHeaders("Cache-Control" -> "no-cache"))
}
