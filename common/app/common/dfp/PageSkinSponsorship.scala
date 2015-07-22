package common.dfp

import common.{Edition, Logging}
import play.api.libs.functional.syntax._
import play.api.libs.json._


case class PageSkinSponsorship(lineItemName: String,
                               lineItemId: Long,
                               adUnits: Seq[String],
                               editions: Seq[Edition],
                               countries: Seq[String],
                               isR2Only: Boolean,
                               targetsAdTest: Boolean)

object PageSkinSponsorship {

  implicit val pageSkinSponsorshipWrites = new Writes[PageSkinSponsorship] {
    def writes(sponsorship: PageSkinSponsorship): JsValue = {
      Json.obj(
        "lineItem" -> sponsorship.lineItemName,
        "lineItemId" -> sponsorship.lineItemId,
        "adUnits" -> sponsorship.adUnits,
        "editions" -> sponsorship.editions,
        "countries" -> sponsorship.countries,
        "isR2Only" -> sponsorship.isR2Only,
        "isAdTest" -> sponsorship.targetsAdTest
      )
    }
  }

  implicit val pageskinSponsorShipReads: Reads[PageSkinSponsorship] = (
    (JsPath \ "lineItem").read[String] and
      (JsPath \ "lineItemId").read[Long] and
      (JsPath \ "adUnits").read[Seq[String]] and
      (JsPath \ "editions").read[Seq[Edition]] and
      (JsPath \ "countries").read[Seq[String]] and
      (JsPath \ "isR2Only").read[Boolean] and
      (JsPath \ "isAdTest").read[Boolean]
    )(PageSkinSponsorship.apply _)
}

object PageSkin {
  def isValidForNextGenPageSkin(adUnit: String): Boolean = adUnit.endsWith("/front") || adUnit.endsWith("/front/ng")
}


case class PageSkinSponsorshipReport(updatedTimeStamp: String, sponsorships: Seq[PageSkinSponsorship]) {

  val (deliverableAndTestSponsorships, legacySponsorships) = sponsorships partition { sponsorship =>
    sponsorship.adUnits.exists(PageSkin.isValidForNextGenPageSkin) && (!sponsorship.isR2Only)
  }
  val (testSponsorships, deliverableSponsorships) = deliverableAndTestSponsorships partition (_.targetsAdTest)
}

object PageSkinSponsorshipReport {

  implicit val pageSkinSponsorshipReportWrites = new Writes[PageSkinSponsorshipReport] {
    def writes(report: PageSkinSponsorshipReport): JsValue = {
      Json.obj(
        "updatedTimeStamp" -> report.updatedTimeStamp,
        "sponsorships" -> report.sponsorships
      )
    }
  }

}


object PageSkinSponsorshipReportParser extends Logging {

  def apply(jsonString: String) = {

    implicit val reportReads: Reads[PageSkinSponsorshipReport] = (
      (JsPath \ "updatedTimeStamp").read[String] and
        (JsPath \ "sponsorships").read[Seq[PageSkinSponsorship]]
      )(PageSkinSponsorshipReport.apply _)

    val result: JsResult[PageSkinSponsorshipReport] = Json.parse(jsonString).validate[PageSkinSponsorshipReport]
    result match {
      case s: JsSuccess[PageSkinSponsorshipReport] => Some(s.get)
      case e: JsError => log.error("Errors: " + JsError.toJson(e).toString()); None
    }
  }
}
