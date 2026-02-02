package http

import org.apache.pekko.stream.Materializer
import common.{GuLogging, RequestLogger, StopWatch}
import play.api.mvc.{Filter, RequestHeader, Result}

import scala.concurrent.{ExecutionContext, Future}
import scala.util.{Failure, Success}

class RequestLoggingFilter(implicit val mat: Materializer, executionContext: ExecutionContext)
    extends Filter
    with GuLogging {

  override def apply(next: RequestHeader => Future[Result])(rh: RequestHeader): Future[Result] = {

    val stopWatch = new StopWatch
    val result = next(rh)
    val requestLogger = RequestLogger(rh, response = None, Some(stopWatch))
    result onComplete {
      case Success(response) =>
        val additionalInfo =
          response.header.headers.get("X-Accel-Redirect") match {
            case Some(internalRedirect) => s" - internal redirect to $internalRedirect"
            case None                   =>
              response.header.status match {
                case 304                           => " - 304 Not Modified"
                case status if (status / 100) == 3 =>
                  s" - external redirect to ${response.header.headers.getOrElse("Location", "[location not found]")}"
                case _ => ""
              }
          }
        // don't log uncacheable POST requests due to the volume of them
        // don't log healthcheck successes
        val isHealthcheck = rh.uri == "/_healthcheck"
        val isHealthcheckSuccess = isHealthcheck && response.header.status == 200
        if (rh.method != "POST" && !isHealthcheckSuccess) {
          val status = response.header.status
          val logMessage = s"${rh.method} ${rh.uri}$additionalInfo"
          val logger = requestLogger.withResponse(response)
          if (status >= 500) {
            logger.error(logMessage)
          } else if (status >= 400 && status != 404) {
            logger.info(logMessage)
          } else {
            logger.debug(logMessage)
          }
        }
      case Failure(error) =>
        requestLogger.warn(s"${rh.method} ${rh.uri} failed", error)
    }
    result
  }
}
