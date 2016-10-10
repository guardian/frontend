package filters

import common.{ExecutionContexts, Logging, RequestLogger, StopWatch}
import play.api.mvc.{Filter, RequestHeader, Result}

import scala.concurrent.Future
import scala.util.{Failure, Success}

class RequestLoggingFilter extends Filter with Logging with ExecutionContexts {

  override def apply(next: (RequestHeader) => Future[Result])(rh: RequestHeader): Future[Result] = {

    val stopWatch = new StopWatch
    val result = next(rh)
    val requestLogger = RequestLogger().withRequestHeaders(rh).withStopWatch(stopWatch)
    result onComplete {
      case Success(response) =>
        response.header.headers.get("X-Accel-Redirect") match {
          case Some(internalRedirect) =>
            requestLogger.info(s"${rh.method} ${rh.uri} took ${stopWatch.elapsed} ms and redirected to $internalRedirect")
          case None =>
            requestLogger.info(s"${rh.method} ${rh.uri} took ${stopWatch.elapsed} ms and returned ${response.header.status}")
        }

      case Failure(error) =>
        requestLogger.warn(s"${rh.method} ${rh.uri} failed after ${stopWatch.elapsed} ms", error)
    }
    result
  }
}
