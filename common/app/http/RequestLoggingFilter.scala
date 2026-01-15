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
          requestLogger.withResponse(response).debug(s"${rh.method} ${rh.uri}$additionalInfo")
        }
      case Failure(error) =>
        requestLogger.warn(s"${rh.method} ${rh.uri} failed", error)
    }
    result
  }
}
