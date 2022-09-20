package services.dotcomrendering

import common.GuLogging
import common.LoggingField._
import model.PageWithStoryPackage
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

case class DotcomponentsLogger(request: Option[RequestHeader]) extends GuLogging {

  private def customFields: List[LogField] = DotcomponentsLoggerFields(request).customFields

  def fieldsFromResults(results: Map[String, String]): List[LogField] =
    results.map({ case (k, v) => LogFieldString(k, v) }).toList

  def elementsLogFieldFromPage(page: PageWithStoryPackage): List[LogField] = {
    val bodyBlocks = for {
      blocks <- page.article.blocks.toSeq
      body <- blocks.body
      element <- body.elements
    } yield element.getClass.getSimpleName

    val mainBlocks = for {
      blocks <- page.article.blocks.toSeq
      main <- blocks.main.toSeq
      element <- main.elements
    } yield element.getClass.getSimpleName

    val bodyInteractiveBlockScripts = for {
      blocks <- page.article.blocks.toSeq
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
        page.article.tags.tones.headOption.map(_.name).getOrElse(""),
      ),
      LogFieldString(
        "page.bodyInteractiveElementScripts",
        bodyInteractiveBlockScripts.distinct.mkString(", "),
      ),
    )
  }

  def logRequest(msg: String, results: Map[String, String], page: PageWithStoryPackage)(implicit
      request: RequestHeader,
  ): Unit = {
    withRequestHeaders(request).results(msg, results, page)
  }

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
  val logger = DotcomponentsLogger()

  def apply(): DotcomponentsLogger = DotcomponentsLogger(None)
}
