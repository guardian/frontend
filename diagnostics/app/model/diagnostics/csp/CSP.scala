package model.diagnostics.csp

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
  implicit val jsonReads = Json.reads[CSPReport]
  implicit val jsonWrites = Json.writes[CSPReport]
}

object CSP extends Logging {
  def report(requestBody: JsValue): Unit = {
    (requestBody \ "csp-report").validate[CSPReport] match {
      case JsSuccess(report, _) => log.logger.info(appendRaw("csp", Json.toJson(report).toString()), "csp report")
      case JsError(e) => throw new Exception(JsError.toJson(e).toString())
    }
  }
}
