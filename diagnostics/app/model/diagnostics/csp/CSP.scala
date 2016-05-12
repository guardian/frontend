package model.diagnostics.csp

import play.api.libs.functional.syntax._
import play.api.libs.json._
import common.Logging
import net.logstash.logback.marker.Markers._

case class CSPReport(
  documentUri: String,
  referrer: String,
  blockedUri: String,
  violatedDirective: String,
  effectiveDirective: String,
  originalPolicy: String)

object CSPReport {
  implicit val jsonReads: Reads[CSPReport] = (
    (__ \ "document-uri").read[String] and
      (__ \ "referrer").read[String] and
      (__ \ "blocked-uri").read[String] and
      (__ \ "violated-directive").read[String] and
      (__ \ "effective-directive").read[String] and
      (__ \ "original-policy").read[String]
    )(CSPReport.apply _)

  implicit val jsonWrites: Writes[CSPReport] = (
    (__ \ "document-uri").write[String] and
      (__ \ "referrer").write[String] and
      (__ \ "blocked-uri").write[String] and
      (__ \ "violated-directive").write[String] and
      (__ \ "effective-directive").write[String] and
      (__ \ "original-policy").write[String]
    )(unlift(CSPReport.unapply))
}

object CSP extends Logging {
  def report(requestBody: JsValue): Unit = {
    (requestBody \ "csp-report").validate[CSPReport] match {
      case JsSuccess(report, _) => log.logger.info(appendRaw("csp", Json.toJson(report).toString()), "csp report")
      case JsError(e) => throw new Exception(JsError.toJson(e).toString())
    }
  }
}
