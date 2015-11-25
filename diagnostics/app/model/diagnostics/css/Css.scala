package model.diagnostics.css

import play.api.libs.json._

object CssReport {
  implicit val jsonReads = Json.reads[CssReport]
}

case class CssReport(
  breakpoint: String,
  contentType: String,
  selectors: Map[String, Boolean]
) {
  override def toString: String = {
    selectors.toList.map {
      case (key: String, exists: Boolean) => s"css ; $key ; $exists ; $contentType ; $breakpoint"
    }.mkString("\n")
  }
}

object Css extends common.Logging {
  def report(requestBody: JsValue): Unit = {
    requestBody.validate[CssReport] match {
      case JsSuccess(report, _) =>
        log.info("\n" + report.toString)
        DynamoDbReport.report(report)
      case JsError(e) => throw new Exception(JsError.toJson(e).toString())
    }
  }
}
