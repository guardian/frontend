package model.diagnostics.css

import play.api.libs.json._
import collection.Map

case class CssReport(
  href: String,
  className: String,
  contentType: String,
  selectors: JsObject ) {

  override def toString(): String = {
    val selectorMap = selectors.value.asInstanceOf[Map[String, JsBoolean]]
    selectorMap.map {
      case (key: String, exists:JsBoolean) => s"css ; $key ; $exists ; $contentType ; $href"
    }.mkString("\n")
  }
}

object CssReport {
  implicit val reads = Json.reads[CssReport]
}

object Css extends common.Logging {

  def report(requestBody: JsValue): Unit = {
    requestBody.validate[CssReport] match {
      case JsSuccess(report, _) => log.info("\n" + report.toString)
      case JsError(e) => throw new Exception(JsError.toFlatJson(e).toString())
    }
  }
}
