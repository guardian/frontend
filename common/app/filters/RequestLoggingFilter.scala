package filters

import common.{ExecutionContexts, Logging, StopWatch}
import play.api.mvc.{Result, RequestHeader, Filter}

import scala.concurrent.Future
import scala.util.{Failure, Success}

object RequestLoggingFilter extends Filter with Logging with ExecutionContexts {
  override def apply(next: (RequestHeader) => Future[Result])(rh: RequestHeader): Future[Result] = {
    val stopWatch = new StopWatch

    val result = next(rh)

    result onComplete {
      case Success(response) =>
        response.header.headers.get("X-Accel-Redirect") match {
          case Some(internalRedirect) =>
            log.info(s"${rh.method} ${rh.uri} took ${stopWatch.elapsed} ms and redirected to $internalRedirect")

          case None =>
            log.info(s"${rh.method} ${rh.uri} took ${stopWatch.elapsed} ms and returned ${response.header.status}")
        }

      case Failure(error) =>
        log.warn(s"${rh.method} ${rh.uri} failed after ${stopWatch.elapsed} ms", error)
    }

    result
  }
}
