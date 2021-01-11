package common.dfp

import common.{Edition, GuLogging}
import play.api.libs.json._

/** A PageSkinSponsorship
  *   is a special decoration of a DFP LineItem that we need to scan for ourselves,
  *   because DFP doesn't have this concept.
  */
case class PageSkinSponsorship(
    lineItemName: String,
    lineItemId: Long,
    adUnits: Seq[String],
    // Targeting properties
    editions: Seq[Edition],
    countries: Seq[String],
    targetsAdTest: Boolean,
    adTestValue: Option[String],
    keywords: Seq[String],
    series: Seq[String],
)

object PageSkinSponsorship {
  implicit val pageskinSponsorShipFormat: Format[PageSkinSponsorship] = Json.format[PageSkinSponsorship]
}

case class PageSkinSponsorshipReport(updatedTimeStamp: String, sponsorships: Seq[PageSkinSponsorship]) {
  val (testSponsorships, deliverableSponsorships) = sponsorships partition (_.targetsAdTest)
}

object PageSkinSponsorshipReport {
  implicit val pageSkinSponsorshipReportFormat: Format[PageSkinSponsorshipReport] =
    Json.format[PageSkinSponsorshipReport]
}

object PageSkin {
  private val ngFrontSuffix = "/front/ng"
  private val frontSuffix = "/front"

  private val validAdUnitSuffixes = Seq(ngFrontSuffix, frontSuffix)

  def isValidAdUnit(adUnitPath: String): Boolean = validAdUnitSuffixes.exists(suffix => adUnitPath endsWith suffix)
}

object PageSkinSponsorshipReportParser extends GuLogging {

  def apply(jsonString: String): Option[PageSkinSponsorshipReport] = {

    val result: JsResult[PageSkinSponsorshipReport] = Json.parse(jsonString).validate[PageSkinSponsorshipReport]
    result match {
      case s: JsSuccess[PageSkinSponsorshipReport] => Some(s.get)
      case e: JsError                              => log.error("Errors: " + JsError.toJson(e).toString()); None
    }
  }
}
