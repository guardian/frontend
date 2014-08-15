package dfp

import common.editions
import common.{Edition, Logging}

case class PageSkinSponsorship(lineItemName: String,
                               lineItemId: Long,
                               adUnits: Seq[String],
                               countries: Seq[Country],
                               targetsAdTest: Boolean)

case class Country(name: String, editionId: String)

object Country {
  def fromName(name: String) = {
    val edition = name match {
      case "United States" => editions.Us
      case "Australia" => editions.Au
      case _ => Edition.defaultEdition
    }
    Country(name, edition.id)
  }
}

case class PageSkinSponsorshipReport(updatedTimeStamp: String, sponsorships: Seq[PageSkinSponsorship]) {

  val (deliverableAndTestSponsorships, legacySponsorships) = sponsorships partition {
    _.adUnits.exists(adUnit => adUnit.endsWith("/front") || adUnit.endsWith("/front/ng"))
  }
  val (testSponsorships, deliverableSponsorships) = deliverableAndTestSponsorships partition (_.targetsAdTest)
}

object PageSkinSponsorshipReportParser extends Logging {
  import play.api.libs.functional.syntax._
  import play.api.libs.json._

  def apply(jsonString: String) = {

    implicit val countryReads: Reads[Country] = (
      (JsPath \ "name").read[String] and
        (JsPath \ "editionId").read[String]
      )(Country.apply _)

    implicit val pageskinSponsorShipReads: Reads[PageSkinSponsorship] = (
      (JsPath \ "lineItem").read[String] and
        (JsPath \ "lineItemId").read[Long] and
        (JsPath \ "adUnits").read[Seq[String]] and
        (JsPath \ "countries").read[Seq[Country]] and
        (JsPath \ "isAdTest").read[Boolean]
      )(PageSkinSponsorship.apply _)

    implicit val reportReads: Reads[PageSkinSponsorshipReport] = (
      (JsPath \ "updatedTimeStamp").read[String] and
        (JsPath \ "sponsorships").read[Seq[PageSkinSponsorship]]
      )(PageSkinSponsorshipReport.apply _)

    val result: JsResult[PageSkinSponsorshipReport] = Json.parse(jsonString).validate[PageSkinSponsorshipReport]
    result match {
      case s: JsSuccess[PageSkinSponsorshipReport] => Some(s.get)
      case e: JsError => log.error("Errors: " + JsError.toFlatJson(e).toString()); None
    }
  }
}
