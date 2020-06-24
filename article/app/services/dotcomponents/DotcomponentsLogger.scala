package services.dotcomponents

import common.Logging
import common.LoggingField._
import model.PageWithStoryPackage
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

  def fieldsFromResults(results: Map[String, String]):List[LogField] =
    results.map({ case (k, v) => LogFieldString(k, v)}).toList

  def elementsLogFieldFromPage(page: PageWithStoryPackage): List[LogField] = List(
    LogFieldString(
      "page.elements",
      (
        page.article.blocks match {
          case Some(blocks) => blocks.body.flatMap(bblock => bblock.elements) map (be => be.getClass.getSimpleName)
          case None => Seq()
        }
      ).distinct.mkString(", ")
    ),
    LogFieldString(
      "page.tone", page.article.tags.tones.headOption.map(_.name).getOrElse("")
    )
  )

  def withRequestHeaders(rh: RequestHeader): DotcomponentsLogger = {
    copy(Some(rh))
  }


  def results(message: String, results: Map[String, String], page: PageWithStoryPackage): Unit = {
    logInfoWithCustomFields(message, customFields ++ fieldsFromResults(results) ++ elementsLogFieldFromPage(page))
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
