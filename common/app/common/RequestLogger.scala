package common

import play.api.mvc.{RequestHeader, Result}
import common.LoggingField._
import play.api.routing.Router

import scala.util.{Random, Try}

case class RequestLoggerFields(request: Option[RequestHeader], response: Option[Result], stopWatch: Option[StopWatch]) {

  private lazy val requestHeadersFields: List[LogField] = {
    val allowListedHeaderNames = Set(
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
      "Fastly-Digest",
      "Accept-Encoding", // TODO remove if seen after 2021/09/03
    )
    val allHeadersFields = request
      .map {
        _.headers.toMap.map {
          case (headerName, headerValues) => (headerName, headerValues.mkString(","))
        }
      }
      .getOrElse(Map.empty[String, String])

    val allowListedHeaders = allHeadersFields.filterKeys(allowListedHeaderNames.contains)
    val guardianSpecificHeaders = allHeadersFields.filterKeys(_.toUpperCase.startsWith("X-GU-"))
    (allowListedHeaders ++ guardianSpecificHeaders).toList.map(t => LogFieldString(s"req.header.${t._1}", t._2))
  }
  private lazy val customFields: List[LogField] = {
    val requestHeaders: List[LogField] = request
      .map { r: RequestHeader =>
        List[LogField](
          "req.method" -> r.method,
          "req.url" -> r.uri,
          "req.id" -> Random.nextInt(Integer.MAX_VALUE).toString,
        )
      }
      .getOrElse(Nil)

    val responseHeaders: List[LogField] = response
      .map { r: Result =>
        List[LogField](
          "resp.status" -> r.header.status,
          "resp.dotcomponents" -> r.header.headers.get("X-GU-Dotcomponents").isDefined,
          "resp.Vary" -> r.header.headers.get("Vary").getOrElse(""), // TODO remove if seen after 2021/09/03
        )
      }
      .getOrElse(Nil)

    val stopWatchHeaders: List[LogField] = stopWatch
      .map { s: StopWatch =>
        List[LogField](
          "req.latency_millis" -> s.elapsed,
        )
      }
      .getOrElse(Nil)

    val actionInfo: List[LogField] = request
      .map { r: RequestHeader =>
        val handlerDefOpt = r.attrs.get(Router.Attrs.HandlerDef)
        List[LogField](
          "action.controller" -> handlerDefOpt.map(_.controller).getOrElse("unknown"),
          "action.method" -> handlerDefOpt.map(_.method).getOrElse("unknown"),
        )
      }
      .getOrElse(Nil)

    requestHeaders ++ responseHeaders ++ stopWatchHeaders ++ actionInfo
  }

  def toList: List[LogField] = customFields ++ requestHeadersFields
}

case class RequestLogger(request: Option[RequestHeader], response: Option[Result], stopWatch: Option[StopWatch])
    extends GuLogging {

  private def allFields: List[LogField] = RequestLoggerFields(request, response, stopWatch).toList

  def withRequestHeaders(rh: RequestHeader): RequestLogger = {
    copy(Some(rh), response, stopWatch)
  }

  def withResponse(resp: Result): RequestLogger = {
    copy(request, Some(resp), stopWatch)
  }

  def withStopWatch(sw: StopWatch): RequestLogger = {
    copy(request, response, Some(sw))
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
  def apply(): RequestLogger = RequestLogger(None, None, None)
}
