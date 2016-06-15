package filters

import common.{ExecutionContexts, Logging, StopWatch}
import play.api.mvc.{Filter, RequestHeader, Result}
import scala.concurrent.Future
import scala.util.{Failure, Random, Success}
import net.logstash.logback.marker.LogstashMarker
import net.logstash.logback.marker.Markers._
import play.api.Logger

import scala.collection.JavaConverters._

class RequestLoggingFilter extends Filter with Logging with ExecutionContexts {

  case class RequestLogger(rh: RequestHeader)(implicit internalLogger: Logger, stopWatch: StopWatch) {
    private lazy val pseudoId = Random.nextInt(Integer.MAX_VALUE)
    private lazy val customFields: Map[String, Any] = {
      val headersFields = rh.headers.toMap.map {
        case (headerName, headerValues) => (s"req.header.$headerName", headerValues.mkString(","))
      }
      Map(
        "req.method" -> rh.method,
        "req.url" -> rh.uri,
        "req.id" -> pseudoId.toString,
        "req.latency_millis" -> stopWatch.elapsed
      ) ++ headersFields
    }

    def info(message: String): Unit = {
      logInfoWithCustomFields(message, customFields)
    }
    def warn(message: String, error: Throwable): Unit = {
      logWarningWithCustomFields(message, error, customFields)
    }
    def error(message: String, error: Throwable): Unit = {
      logErrorWithCustomFields(message, error, customFields)
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
