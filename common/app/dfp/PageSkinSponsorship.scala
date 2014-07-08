package dfp

import play.api.libs.json.{Json, JsValue, Writes}
import common.Logging

case class PageSkinSponsorship(lineItemName: String, lineItemId: Long, adUnits: Seq[String])

case class PageSkinSponsorshipReport(updatedTimeStamp: String, sponsorships: Seq[PageSkinSponsorship]) {
  private implicit val pageSkinSponsorship = new Writes[PageSkinSponsorship] {
    def writes(sponsorship: PageSkinSponsorship): JsValue = {
      Json.obj(
        "lineItem" -> sponsorship.lineItemName,
        "lineItemId" -> sponsorship.lineItemId,
        "adUnits" -> sponsorship.adUnits
      )
    }
  }

  private implicit val pageSkinSponsorshipReportWrites = new Writes[PageSkinSponsorshipReport] {
    def writes(report: PageSkinSponsorshipReport): JsValue = {
      Json.obj(
        "updatedTimeStamp" -> report.updatedTimeStamp,
        "sponsorships" -> report.sponsorships
      )
    }
  }

  def toJson() = Json.toJson(this)
}

object PageSkinSponsorshipReportParser extends Logging {
  import play.api.libs.json._
  import play.api.libs.functional.syntax._

  def apply(jsonString: String) = {
    implicit val pageskinSponsorShipReads: Reads[PageSkinSponsorship] = (
      (JsPath \ "lineItem").read[String] and
        (JsPath \ "lineItemId").read[Long] and
        (JsPath \ "adUnits").read[Seq[String]]
      )(PageSkinSponsorship.apply _)

    implicit val reportReads: Reads[PageSkinSponsorshipReport] = (
      (JsPath \ "updatedTimeStamp").read[String] and
        (JsPath \ "sponsorships").read[Seq[PageSkinSponsorship]]
      )(PageSkinSponsorshipReport.apply _)

    val result: JsResult[PageSkinSponsorshipReport] = Json.parse(jsonString).validate[PageSkinSponsorshipReport]
    result match {
      case s: JsSuccess[PageSkinSponsorshipReport] => Some(s.get)
      case e: JsError => println("Errors: " + JsError.toFlatJson(e).toString()); None
    }
  }
}
