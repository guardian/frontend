package utils

import common.GuLogging
import common.LoggingField._
import model.{PageWithStoryPackage, PressedPage}
import model.liveblog.InteractiveBlockElement
import play.api.mvc.RequestHeader

import scala.util.{Random, Try}

case class DotcomponentsLoggerFields(request: Option[RequestHeader]) {

  lazy val customFields: List[LogField] = {

    val requestHeaders: List[LogField] = request
      .map { r: RequestHeader =>
        List[LogField](
          "req.method" -> r.method,
          "req.url" -> r.uri,
          "req.id" -> Random.nextInt(Integer.MAX_VALUE).toString,
        )
      }
      .getOrElse(Nil)

    requestHeaders

  }

}

case class DotcomFrontsLogger(request: Option[RequestHeader]) extends GuLogging {

  private def customFields: List[LogField] = DotcomponentsLoggerFields(request).customFields

  def fieldsFromResults(results: Map[String, String]): List[LogField] =
    results.map({ case (k, v) => LogFieldString(k, v) }).toList

  def logFieldFromFront(faciaPage: PressedPage): List[LogField] = {
    List(
      LogFieldString(
        "page.id",
        faciaPage.id
      ),
      LogFieldString(
        "page.containers",
        faciaPage.collections.map(_.collectionType).mkString(", "),
      ),
    )
  }

  def logRequest(msg: String, results: Map[String, String], faciaPage: PressedPage)(implicit
      request: RequestHeader,
  ): Unit = {
    withRequestHeaders(request).results(msg, results, faciaPage)
  }

  def withRequestHeaders(rh: RequestHeader): DotcomFrontsLogger = {
    copy(Some(rh))
  }

  def results(message: String, results: Map[String, String], faciaPage: PressedPage): Unit = {
    logInfoWithCustomFields(message, customFields ++ fieldsFromResults(results) ++ logFieldFromFront(faciaPage))
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

object DotcomFrontsLogger {
  val logger = DotcomFrontsLogger()

  def apply(): DotcomFrontsLogger = DotcomFrontsLogger(None)
}
