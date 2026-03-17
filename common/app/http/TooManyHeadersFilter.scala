package http

import com.google.common.util.concurrent.RateLimiter
import org.apache.pekko.stream.Materializer
import play.api.Logger
import play.api.mvc.{Filter, RequestHeader, Result}

import scala.concurrent.Future

class TooManyHeadersFilter(implicit val mat: Materializer) extends Filter {
  private val MAX_HEADERS = 64

  private val logging: Logger = Logger(this.getClass)
  private val rateLimiter = RateLimiter.create(0.1) // 1 permit per 10 seconds

  override def apply(f: RequestHeader => Future[Result])(rh: RequestHeader): Future[Result] = {
    // Log a warning for requests with an excessive number of headers, sampling with rate limiter at 1 permit in 10 seconds
    if (rh.headers.keys.size > MAX_HEADERS && rateLimiter.tryAcquire()) {
      logging.warn(
        s"Request with too many headers: ${rh.headers.keys.size} headers: ${rh.headers.keys.mkString(",")}",
      )
    }
    f(rh)
  }
}
