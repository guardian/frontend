package common.dfp

import common.{Edition, Logging}
import play.api.libs.json._

case class PageSkinSponsorship(lineItemName: String,
                               lineItemId: Long,
                               adUnits: Seq[String],
                               editions: Seq[Edition],
                               countries: Seq[String],
                               isR2Only: Boolean,
                               targetsAdTest: Boolean,
                               adTestValue: Option[String],
                               keywords: Seq[String])

object PageSkinSponsorship {
  implicit val pageskinSponsorShipFormat: Format[PageSkinSponsorship] = Json.format[PageSkinSponsorship]
}

case class PageSkinSponsorshipReport(updatedTimeStamp: String, sponsorships: Seq[PageSkinSponsorship]) {
  val (testSponsorships, deliverableSponsorships) = sponsorships partition (_.targetsAdTest)
}

object PageSkinSponsorshipReport {
  implicit val pageSkinSponsorshipReportFormat: Format[PageSkinSponsorshipReport] = Json.format[PageSkinSponsorshipReport]
}

object PageSkin {
  def isValidAdUnit(adUnitPath: String): Boolean = (adUnitPath endsWith "/front/ng") || (adUnitPath endsWith "/front")
}

object PageSkinSponsorshipReportParser extends Logging {

  def apply(jsonString: String): Option[PageSkinSponsorshipReport] = {

    val result: JsResult[PageSkinSponsorshipReport] = Json.parse(jsonString).validate[PageSkinSponsorshipReport]
    result match {
      case s: JsSuccess[PageSkinSponsorshipReport] => Some(s.get)
      case e: JsError => log.error("Errors: " + JsError.toJson(e).toString()); None
    }
  }
}
