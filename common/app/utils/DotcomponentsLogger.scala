package utils

import common.GuLogging
import common.LoggingField._
import model.ContentType
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
          "requestId" -> r.headers.get("x-request-id").getOrElse("request-id-not-provided"),
        )
      }
      .getOrElse(Nil)

    requestHeaders

  }

}

case class DotcomponentsLogger(request: Option[RequestHeader]) extends GuLogging {

  private def customFields: List[LogField] = DotcomponentsLoggerFields(request).customFields

  def fieldsFromResults(results: Map[String, String]): List[LogField] =
    results.map({ case (k, v) => LogFieldString(k, v) }).toList

  def elementsLogFieldFromPage(content: ContentType): List[LogField] = {

    val bodyBlocks = for {
      blocks <- content.fields.blocks.toSeq
      body <- blocks.body
      element <- body.elements
    } yield element.getClass.getSimpleName

    val mainBlocks = for {
      blocks <- content.fields.blocks.toSeq
      main <- blocks.main.toSeq
      element <- main.elements
    } yield element.getClass.getSimpleName

    val bodyInteractiveBlockScripts = for {
      blocks <- content.fields.blocks.toSeq
      body <- blocks.body
      element <- body.elements if element.isInstanceOf[InteractiveBlockElement]
      interactiveElement <- Try(element.asInstanceOf[InteractiveBlockElement]).toOption
      scriptUrl <- interactiveElement.scriptUrl
    } yield scriptUrl

    List(
      LogFieldString(
        "page.elements",
        bodyBlocks.distinct.mkString(", "),
      ),
      LogFieldString(
        "page.mainElements",
        mainBlocks.distinct.mkString(", "),
      ),
      LogFieldString(
        "page.tone",
        content.tags.tones.headOption.map(_.name).getOrElse(""),
      ),
      LogFieldString(
        "page.bodyInteractiveElementScripts",
        bodyInteractiveBlockScripts.distinct.mkString(", "),
      ),
    )
  }

  def logRequest(msg: String, results: Map[String, String], page: ContentType)(implicit
      request: RequestHeader,
  ): Unit = {
    withRequestHeaders(request).results(msg, results, Some(page))
  }

  def logRequestForNonContentPage(msg: String, results: Map[String, String])(implicit
      request: RequestHeader,
  ): Unit = {
    withRequestHeaders(request).results(msg, results, None)
  }

  def withRequestHeaders(rh: RequestHeader): DotcomponentsLogger = {
    copy(Some(rh))
  }

  def results(message: String, results: Map[String, String], page: Option[ContentType]): Unit = {
    val elementsLogFieldFromContent = page.map(elementsLogFieldFromPage).getOrElse(List.empty)
    logDebugWithCustomFields(message, customFields ++ fieldsFromResults(results) ++ elementsLogFieldFromContent)
  }

}

object DotcomponentsLogger {
  val logger = DotcomponentsLogger()

  def apply(): DotcomponentsLogger = DotcomponentsLogger(None)
}
