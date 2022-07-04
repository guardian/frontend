package http

import akka.stream.Materializer

import play.api.mvc._
import utils.SafeLogging

import scala.concurrent.Future

class HeaderLoggingFilter(implicit val mat: Materializer) extends Filter with SafeLogging {
  def logHeaders(rh: RequestHeader): Unit = {
    val keys: Set[String] = rh.headers.keys filterNot { name =>
      "Cookie" == name || "User-Agent" == name || "Authorization" == name
    }

    val kvs: Set[(String, String)] = keys flatMap { key =>
      rh.headers.getAll(key) map { value => key -> value }
    }

    val header = kvs map { case (k, v) => s"$k=$v" } mkString "&"

    logger.debug(s"Request headers: $header")
  }

  def apply(next: (RequestHeader) => Result)(rh: RequestHeader): Result = {
    if (logger.isDebugEnabled) { logHeaders(rh) }
    next(rh)
  }

  def apply(next: (RequestHeader) => Future[Result])(rh: RequestHeader): Future[Result] = {
    if (logger.isDebugEnabled) { logHeaders(rh) }
    next(rh)
  }
}
