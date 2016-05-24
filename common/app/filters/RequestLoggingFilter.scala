package filters

import common.{ExecutionContexts, Logging, StopWatch}
import play.api.mvc.{Result, RequestHeader, Filter}

import scala.concurrent.Future
import scala.util.{Failure, Random, Success}
import conf.switches.Switches

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

object DiscussionRequestLoggingFilter extends Filter with Logging with ExecutionContexts {
  override def apply(next: (RequestHeader) => Future[Result])(rh: RequestHeader): Future[Result] = {

    val requestId = Random.nextInt(Integer.MAX_VALUE)

    if(Switches.LogAllDiscussionIncomingRequests.isSwitchedOn) {
      log.info(s"Start handling ${rh.method} ${rh.uri} (requestID: ${requestId})")
    }

    val stopWatch = new StopWatch
    val result = next(rh)
    result onComplete {
      case Success(response) =>
        response.header.headers.get("X-Accel-Redirect") match {
          case Some(internalRedirect) =>
            log.info(s"${rh.method} ${rh.uri} took ${stopWatch.elapsed} ms and redirected to $internalRedirect (requestID: ${requestId})")

          case None =>
            log.info(s"${rh.method} ${rh.uri} took ${stopWatch.elapsed} ms and returned ${response.header.status} (requestID: ${requestId})")
        }

      case Failure(error) =>
        log.warn(s"${rh.method} ${rh.uri} failed after ${stopWatch.elapsed} ms (requestID: ${requestId})", error)
    }
    result
  }
}
