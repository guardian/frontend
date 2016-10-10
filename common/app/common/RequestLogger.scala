package common

import play.api.mvc.RequestHeader
import common.LoggingField._

case class RequestLogger(rh: Option[RequestHeader], sw: Option[StopWatch]) extends Logging {
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
    val allHeadersFields = rh.map {
      _.headers.toMap.map {
        case (headerName, headerValues) => (headerName, headerValues.mkString(","))
      }
    }.getOrElse(Map.empty[String, String])

    val whitelistedHeaders = allHeadersFields.filterKeys(whitelistedHeaderNames.contains(_))
    val guardianSpecificHeaders = allHeadersFields.filterKeys(_.toUpperCase.startsWith("X-GU-"))
    (whitelistedHeaders ++ guardianSpecificHeaders).toList.map(t => LogFieldString(s"req.header.${t._1}", t._2))
  }
  private lazy val customFields: List[LogField] = {
    val requestHeaders: List[LogField] = rh.map { r: RequestHeader =>
      List[LogField](
        "req.method" -> r.method,
        "req.url" -> r.uri,
        "req.id" -> r.id.toString
      )
    }.getOrElse(Nil)

    val stopWatchHeaders: List[LogField] = sw.map { s: StopWatch =>
      List[LogField](
        "req.latency_millis" -> s.elapsed
      )
    }.getOrElse(Nil)

    requestHeaders ++ stopWatchHeaders
  }

  private[common] lazy val allFields: List[LogField] = customFields ++ headersFields

  def withRequestHeaders(requestHeader: RequestHeader): RequestLogger = {
    copy(Some(requestHeader), sw)
  }

  def withStopWatch(stopWatch: StopWatch): RequestLogger = {
    copy(rh, Some(stopWatch))
  }

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

object RequestLogger {
  def apply(): RequestLogger = RequestLogger(None, None)
}
