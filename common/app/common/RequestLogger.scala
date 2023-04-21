package common

import com.madgag.scala.collection.decorators._
import play.api.mvc.{RequestHeader, Result}
import common.LoggingField._
import play.api.routing.Router

import scala.util.Random

case class RequestLoggerFields(request: RequestHeader, response: Option[Result], stopWatch: Option[StopWatch]) {

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

    val allHeadersFields = request.headers.toMap.mapV(_.mkString(","))

    val allowListedHeaders = (for {
      headerName <- allowListedHeaderNames
      value <- allHeadersFields.get(headerName)
    } yield headerName -> value).toMap

    val guardianSpecificHeaders = allHeadersFields.view.filterKeys(_.toUpperCase.startsWith("X-GU-")).toMap

    (allowListedHeaders ++ guardianSpecificHeaders).toList.map {
      case (headerName, headerValue) =>
        LogFieldString(s"req.header.$headerName", headerValue)
    }
  }
  private lazy val customFields: List[LogField] = {
    val requestHeaders: List[LogField] = List[LogField](
      "req.method" -> request.method,
      "req.url" -> request.uri,
      "req.id" -> Random.nextInt(Integer.MAX_VALUE).toString,
    )

    val responseHeaders: List[LogField] = response
      .map { r: Result =>
        List[LogField](
          "resp.status" -> r.header.status,
          "resp.dotcomponents" -> r.header.headers.contains("X-GU-Dotcomponents"),
          "resp.Vary" -> r.header.headers.getOrElse("Vary", ""), // TODO remove if seen after 2021/09/03
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

    val actionInfo: List[LogField] = {
      val handlerDefOpt = request.attrs.get(Router.Attrs.HandlerDef)
      List[LogField](
        "action.controller" -> handlerDefOpt.map(_.controller).getOrElse("unknown"),
        "action.method" -> handlerDefOpt.map(_.method).getOrElse("unknown"),
      )
    }

    requestHeaders ++ responseHeaders ++ stopWatchHeaders ++ actionInfo
  }

  def toList: List[LogField] = customFields ++ requestHeadersFields
}

case class RequestLogger(request: RequestHeader, response: Option[Result], stopWatch: Option[StopWatch])
    extends GuLogging {

  private def allFields: List[LogField] = RequestLoggerFields(request, response, stopWatch).toList

  def withResponse(resp: Result): RequestLogger = {
    copy(request, Some(resp), stopWatch)
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
