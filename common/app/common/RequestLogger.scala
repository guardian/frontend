package common

import play.api.mvc.RequestHeader
import common.LoggingField._

case class RequestLogger(rh: RequestHeader)(implicit stopWatch: StopWatch) extends Logging {
  private lazy val headersFields: List[LogField] = {
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
      "Fastly-SSL",
      "Fastly-Digest"
    )
    val allHeadersFields = rh.headers.toMap.map {
      case (headerName, headerValues) => (headerName, headerValues.mkString(","))
    }
    val whitelistedHeaders = allHeadersFields.filterKeys(whitelistedHeaderNames.contains(_))
    val guardianSpecificHeaders = allHeadersFields.filterKeys(_.toUpperCase.startsWith("X-GU-"))
    (whitelistedHeaders ++ guardianSpecificHeaders).toList.map(t => LogFieldString(s"req.header.${t._1}", t._2))
  }
  private lazy val customFields: List[LogField] = List(
    "req.method" -> rh.method,
    "req.url" -> rh.uri,
    "req.id" -> rh.id.toString,
    "req.latency_millis" -> stopWatch.elapsed
  )
  private[common] lazy val allFields: List[LogField] = customFields ++ headersFields

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
