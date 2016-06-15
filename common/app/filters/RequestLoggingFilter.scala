package filters

import common.{ExecutionContexts, Logging, StopWatch}
import play.api.mvc.{Filter, RequestHeader, Result}
import scala.concurrent.Future
import scala.util.{Failure, Random, Success}
import play.api.Logger

class RequestLoggingFilter extends Filter with Logging with ExecutionContexts {

  case class RequestLogger(rh: RequestHeader)(implicit internalLogger: Logger, stopWatch: StopWatch) {
    private lazy val pseudoId = Random.nextInt(Integer.MAX_VALUE)
    private val headersFields: List[LogField] = {
      val whitelistedHeaderNames = Set(
        "Host",
        "From",
        "Origin",
        "Referer",
        "User-Agent",
        "Cache-Control",
        "If-None-Match",
        "ETag",
        "Fastly-Client",
        "Fastly-Client-IP",
        "Fastly-FF",
        "Fastly-SSL"
      )
      val allHeadersFields = rh.headers.toMap.map {
        case (headerName, headerValues) => (headerName, headerValues.mkString(","))
      }
      val whitelistedHeaders = allHeadersFields.filterKeys(whitelistedHeaderNames.contains(_))
      val guardianSpecificHeaders = allHeadersFields.filterKeys(_.startsWith("X-GU-"))
      (whitelistedHeaders ++ guardianSpecificHeaders).toList.map(t => LogFieldString(s"req.header.${t._1}", t._2))
    }
    private val customFields: List[LogField] = List(
      "req.method" -> rh.method,
      "req.url" -> rh.uri,
      "req.id" -> pseudoId.toString,
      "req.latency_millis" -> stopWatch.elapsed
    )
    private val allFields = customFields ++ headersFields

    def info(message: String): Unit = {
      logInfoWithCustomFields(message, allFields)
    }
    def warn(message: String, error: Throwable): Unit = {
      logWarningWithCustomFields(message, error, allFields)
    }
    def error(message: String, error: Throwable): Unit = {
      logErrorWithCustomFields(message, error, allFields)
    }
  }

  override def apply(next: (RequestHeader) => Future[Result])(rh: RequestHeader): Future[Result] = {

    implicit val stopWatch = new StopWatch
    val result = next(rh)
    val requestLogger = RequestLogger(rh)
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
