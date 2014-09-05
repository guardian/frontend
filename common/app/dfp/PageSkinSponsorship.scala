package dfp

import common.{Edition, Logging, editions}
import play.api.libs.functional.syntax._
import play.api.libs.json._


case class Country(name: String, editionId: String)

object Country {

  implicit val countryWrites = new Writes[Country] {
    def writes(country: Country): JsValue = {
      Json.obj(
        "name" -> country.name,
        "editionId" -> country.editionId
      )
    }
  }

  implicit val countryReads: Reads[Country] = (
    (JsPath \ "name").read[String] and
      (JsPath \ "editionId").read[String]
    )(Country.apply _)

  def fromName(name: String) = {
    val edition = name match {
      case "United States" => editions.Us
      case "Australia" => editions.Au
      case _ => Edition.defaultEdition
    }
    Country(name, edition.id)
  }
}


case class PageSkinSponsorship(lineItemName: String,
                               lineItemId: Long,
                               adUnits: Seq[String],
                               countries: Seq[Country],
                               isR2Only: Boolean,
                               targetsAdTest: Boolean)

object PageSkinSponsorship {

  implicit val pageSkinSponsorshipWrites = new Writes[PageSkinSponsorship] {
    def writes(sponsorship: PageSkinSponsorship): JsValue = {
      Json.obj(
        "lineItem" -> sponsorship.lineItemName,
        "lineItemId" -> sponsorship.lineItemId,
        "adUnits" -> sponsorship.adUnits,
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
      (JsPath \ "countries").read[Seq[Country]] and
      (JsPath \ "isR2Only").read[Boolean] and
      (JsPath \ "isAdTest").read[Boolean]
    )(PageSkinSponsorship.apply _)
}


case class PageSkinSponsorshipReport(updatedTimeStamp: String, sponsorships: Seq[PageSkinSponsorship]) {

  val (deliverableAndTestSponsorships, legacySponsorships) = sponsorships partition { sponsorship =>
    sponsorship.adUnits.exists(adUnit => adUnit.endsWith("/front") || adUnit.endsWith("/front/ng")) && (!sponsorship.isR2Only)
  }
  val (testSponsorships, deliverableSponsorships) = deliverableAndTestSponsorships partition (_.targetsAdTest)
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
      case e: JsError => log.error("Errors: " + JsError.toFlatJson(e).toString()); None
    }
  }
}
