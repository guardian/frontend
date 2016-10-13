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
        val additionalInfo = response.header.headers.get("X-Accel-Redirect") match {
          case Some(internalRedirect) => s" - internal redirect to $internalRedirect"
          case None => ""
        }
        requestLogger.withResponse(response).info(s"${rh.method} ${rh.uri}$additionalInfo")
      case Failure(error) =>
        requestLogger.warn(s"${rh.method} ${rh.uri} failed", error)
    }
    result
  }
}
