package dfp

import play.api.libs.json.{Json, JsValue, Writes}
import common.Logging

case class Sponsorship(tags: Seq[String], sponsor: Option[String]) {

  def hasTag(tagId: String): Boolean = tags contains (tagId.split('/').last)
}

case class SponsorshipReport(updatedTimeStamp: String, sponsorships: Seq[Sponsorship])

object SponsorshipReportParser extends Logging {
  import play.api.libs.json._
  import play.api.libs.functional.syntax._


  def apply(jsonString: String) = {
    implicit val sponsorshipReads: Reads[Sponsorship] = (
      (JsPath \ "tags").read[Seq[String]] and
        (JsPath \ "sponsor").read[Option[String]]
      )(Sponsorship.apply _)

    implicit val sponsorshipReportReads: Reads[SponsorshipReport] = (
      (JsPath \ "updatedTimeStamp").read[String] and
        (JsPath \ "sponsorships").read[Seq[Sponsorship]]
      )(SponsorshipReport.apply _)


    val result: JsResult[SponsorshipReport] = Json.parse(jsonString).validate[SponsorshipReport]
    result match {
      case s: JsSuccess[SponsorshipReport] => Some(s.get)
      case e: JsError => log.error("Errors: " + JsError.toFlatJson(e).toString()); None
    }
  }
}
