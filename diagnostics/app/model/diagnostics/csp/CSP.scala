package model.diagnostics.csp

import play.api.libs.functional.syntax._
import play.api.libs.json._
import common.Logging
import net.logstash.logback.marker.Markers._

case class CSPReport(
  documentUri: Option[String],
  referrer: Option[String],
  blockedUri: Option[String],
  violatedDirective: Option[String],
  effectiveDirective: Option[String],
  originalPolicy: Option[String]) {
  // used to filter reports consisting of about:blank, safari-extension:// etc urls
  val isHTTP = blockedUri.exists(_.startsWith("http")) && documentUri.exists(_.startsWith("http"))
}

object CSPReport {
  implicit val jsonReads: Reads[CSPReport] = (
    (__ \ "document-uri").readNullable[String] and
      (__ \ "referrer").readNullable[String] and
      (__ \ "blocked-uri").readNullable[String] and
      (__ \ "violated-directive").readNullable[String] and
      (__ \ "effective-directive").readNullable[String] and
      (__ \ "original-policy").readNullable[String]
    )(CSPReport.apply _)

  implicit val jsonWrites: Writes[CSPReport] = (
    (__ \ "document-uri").writeNullable[String] and
      (__ \ "referrer").writeNullable[String] and
      (__ \ "blocked-uri").writeNullable[String] and
      (__ \ "violated-directive").writeNullable[String] and
      (__ \ "effective-directive").writeNullable[String] and
      (__ \ "original-policy").writeNullable[String]
    )(unlift(CSPReport.unapply))
}

object CSP extends Logging {
  def report(requestBody: JsValue): Unit = {
    (requestBody \ "csp-report").validate[CSPReport] match {
      case JsSuccess(report, _) => if (report.isHTTP) log.logger.info(appendRaw("csp", Json.toJson(report).toString()), "csp report")
      case JsError(e) => throw new Exception(JsError.toJson(e).toString())
    }
  }
}
