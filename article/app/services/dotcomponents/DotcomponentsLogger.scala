package services.dotcomponents

import common.Logging
import common.LoggingField._
import play.api.mvc.RequestHeader

import scala.util.Random

case class DotcomponentsLoggerFields(request: Option[RequestHeader]) {

  lazy val customFields: List[LogField] = {

    val requestHeaders: List[LogField] = request.map { r: RequestHeader =>
      List[LogField](
        "req.method" -> r.method,
        "req.url" -> r.uri,
        "req.id" -> Random.nextInt(Integer.MAX_VALUE).toString
      )
    }.getOrElse(Nil)

    requestHeaders

  }

}

case class DotcomponentsLogger(request: Option[RequestHeader]) extends Logging {

  private def customFields: List[LogField] = DotcomponentsLoggerFields(request).customFields

  def fieldsFromResults(results: List[(String, Boolean)]):List[LogField] =
    results.map(x => LogFieldString(x._1, x._2.toString))

  def withRequestHeaders(rh: RequestHeader): DotcomponentsLogger = {
    copy(Some(rh))
  }

  def results(message: String, results: List[(String, Boolean)]): Unit = {
    logInfoWithCustomFields(message, customFields ++ fieldsFromResults(results))
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

object DotcomponentsLogger {
  def apply(): DotcomponentsLogger = DotcomponentsLogger(None)
}
