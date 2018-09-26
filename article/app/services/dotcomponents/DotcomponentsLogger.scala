package services.dotcomponents

import common.Logging
import common.LoggingField._
import play.api.mvc.RequestHeader

import scala.util.Random

case class DotcomponentsLoggerFields(request: Option[RequestHeader]) {

  private lazy val customFields: List[LogField] = {

    val requestHeaders: List[LogField] = request.map { r: RequestHeader =>
      List[LogField](
        "req.method" -> r.method,
        "req.url" -> r.uri,
        "req.id" -> Random.nextInt(Integer.MAX_VALUE).toString
      )
    }.getOrElse(Nil)

    requestHeaders

  }

  def toList: List[LogField] = customFields

}

case class DotcomponentsLogger(request: Option[RequestHeader]) extends Logging {

  private def allFields: List[LogField] = DotcomponentsLoggerFields(request).toList

  def withRequestHeaders(rh: RequestHeader): DotcomponentsLogger = {
    copy(Some(rh))
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

object DotcomponentsLogger {
  def apply(): DotcomponentsLogger = DotcomponentsLogger(None)
}
