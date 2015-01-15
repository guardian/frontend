package model.diagnostics.css

import play.api.libs.json._

case class CssReport(
  href: String,
  breakpoint: String,
  className: String,
  contentType: String,
  selectors: JsObject ) {

  override def toString(): String = {
    selectors.value.toList.collect {
      case (key: String, exists:JsBoolean) => s"css ; $key ; $exists ; $contentType ; $breakpoint ; $href"
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
