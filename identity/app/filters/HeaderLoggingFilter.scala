package filters

import play.api.mvc._
import utils.SafeLogging
import common.ExecutionContexts
import scala.concurrent.Future


object HeaderLoggingFilter extends Filter with SafeLogging with ExecutionContexts {
  def logHeaders(rh: RequestHeader) {
    val keys: Set[String] = rh.headers.keys filterNot { name =>
      "Cookie" == name || "User-Agent" == name || "Authorization" == name
    }

    val kvs: Set[(String, String)] = keys flatMap { key =>
      rh.headers.getAll(key) map { value => key -> value}
    }

    val header = kvs map { case (k, v) => s"$k=$v" } mkString "&"

    logger.debug(s"Request headers: $header")
  }

  def apply(next: (RequestHeader) => SimpleResult)(rh: RequestHeader) = {
    if (logger.isDebugEnabled) { logHeaders(rh) }
    next(rh)
  }

  def apply(next: (RequestHeader) => Future[SimpleResult])(rh: RequestHeader): Future[SimpleResult] = {
    if (logger.isDebugEnabled) { logHeaders(rh) }
    next(rh)
  }
}
