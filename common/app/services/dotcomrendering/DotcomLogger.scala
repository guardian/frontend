package services.dotcomrendering

import common.GuLogging
import common.LoggingField._
import model.PressedPage
import play.api.mvc.RequestHeader
import services.IndexPage

import scala.util.Random

case class DotcomLogger() extends GuLogging {
  private def logFieldFromRequest()(implicit request: RequestHeader): List[LogField] = {
    List[LogField](
      "req.method" -> request.method,
      "req.url" -> request.uri,
      "req.id" -> Random.nextInt(Integer.MAX_VALUE).toString,
    )
  }

  private def logFieldFromProperties(properties: Map[String, String]): List[LogField] =
    properties.map({ case (key, value) => LogFieldString(key, value) }).toList

  private def logFieldFromFront(faciaPage: PressedPage): List[LogField] = {
    List(
      LogFieldString(
        "front.id",
        faciaPage.id,
      ),
      LogFieldString(
        "front.collections",
        faciaPage.collections.map(_.collectionType).mkString(", "),
      ),
    )
  }

  private def logFieldFromTagFront(tagFront: IndexPage): List[LogField] = {
    List(
      LogFieldString(
        "tagFront.id",
        tagFront.metadata.id,
      ),
    )
  }

  def logRequest(msg: String, properties: Map[String, String], faciaPage: PressedPage)(implicit
      request: RequestHeader,
  ): Unit = {
    logInfoWithCustomFields(msg, logFieldFromProperties(properties) ++ logFieldFromRequest() ++ logFieldFromFront(faciaPage))
  }

  def logRequest(msg: String, properties: Map[String, String], indexPage: IndexPage)(implicit
                                                                                     request: RequestHeader,
  ): Unit = {
    logInfoWithCustomFields(msg, logFieldFromProperties(properties) ++ logFieldFromRequest() ++ logFieldFromTagFront(indexPage) )
  }

}

object DotcomLogger {
  val logger: DotcomLogger = DotcomLogger()
}
