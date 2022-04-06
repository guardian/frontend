package utils

import common.GuLogging
import common.LoggingField._
import model.PressedPage
import play.api.mvc.RequestHeader

import scala.util.Random

case class DotcomFrontsLogger() extends GuLogging {
  def logFieldFromRequest()(implicit request: RequestHeader): List[LogField] = {
    List[LogField](
      "req.method" -> request.method,
      "req.url" -> request.uri,
      "req.id" -> Random.nextInt(Integer.MAX_VALUE).toString,
    )
  }

  def logFieldFromProperties(properties: Map[String, String]): List[LogField] =
    properties.map({ case (key, value) => LogFieldString(key, value) }).toList

  def logFieldFromFront(faciaPage: PressedPage): List[LogField] = {
    List(
      LogFieldString(
        "front.id",
        faciaPage.id,
      ),
      LogFieldArray(
        "front.collections.array",
        faciaPage.collections.map(_.collectionType).toArray,
      ),
    )
  }

  def logRequest(msg: String, properties: Map[String, String], faciaPage: PressedPage)(implicit
      request: RequestHeader,
  ): Unit = {
    log(msg, logFieldFromProperties(properties) ++ logFieldFromRequest(), faciaPage)
  }

  def log(message: String, results: List[LogField], faciaPage: PressedPage): Unit = {
    logInfoWithCustomFields(message, results ++ logFieldFromFront(faciaPage))
  }
}

object DotcomFrontsLogger {
  val logger = DotcomFrontsLogger()
}
