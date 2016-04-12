package model.diagnostics.csp

import model.diagnostics.CSPDynamoDbReport
import play.api.libs.functional.syntax._
import play.api.libs.json._
import org.joda.time.Instant

case class CSPReport(
  blockedUri: String,
  documentUri: String,
  effectiveDirective: String,
  originalPolicy: String,
  referrer: String,
  statusCode: Option[Int],
  violatedDirective: String,
  timestamp: Long)

object CSPReport {
  implicit val jsonReads: Reads[CSPReport] = (
    (__ \ "blocked-uri").read[String] and
      (__ \ "document-uri").read[String] and
      (__ \ "effective-directive").read[String] and
      (__ \ "original-policy").read[String] and
      (__ \ "referrer").read[String] and
      (__ \ "status-code").readNullable[Int] and
      (__ \ "violated-directive").read[String] and
      Reads.pure(new Instant().getMillis)
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
