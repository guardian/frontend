package model.diagnostics.csp

import model.diagnostics.CSPDynamoDbReport
import play.api.libs.functional.syntax._
import play.api.libs.json._

case class CSPReport(
  blockedUri: String,
  documentUri: String)

object CSPReport {
  implicit val jsonReads: Reads[CSPReport] = (
    (__ \ "blocked-uri").read[String] and
      (__ \ "document-uri").read[String]
    )(CSPReport.apply _)
}

object CSP {
  def report(requestBody: JsValue): Unit = {
    (requestBody \ "csp-report").validate[CSPReport] match {
      case JsSuccess(report, _) => CSPDynamoDbReport.report(report)
      case JsError(e) => throw new Exception(JsError.toJson(e).toString())
    }
  }
}
