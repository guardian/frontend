package http

import org.apache.pekko.stream.Materializer
import play.api.Logger
import play.api.mvc.{Filter, RequestHeader, Result}

import scala.concurrent.Future
import scala.util.Random

class TooManyHeadersFilter(implicit val mat: Materializer) extends Filter {
  private val MAX_HEADERS = 64

  private val logging: Logger = Logger(this.getClass)

  override def apply(f: RequestHeader => Future[Result])(rh: RequestHeader): Future[Result] = {
    // Log a warning for requests with an excessive number of headers, sampling at ~1%
    if (rh.headers.keys.size > MAX_HEADERS && Random.nextInt(100) == 0) {
      logging.warn(
        s"Request with too many headers: ${rh.headers.keys.size} headers: ${rh.headers.keys.mkString(",")}",
      )
    }
    f(rh)
  }
}
