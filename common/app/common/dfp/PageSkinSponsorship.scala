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
                               targetsAdTest: Boolean,
                               adTestValue: Option[String])

object PageSkinSponsorship {

  implicit val pageskinSponsorShipFormat: Format[PageSkinSponsorship] = (
      (JsPath \ "lineItem").format[String] and
      (JsPath \ "lineItemId").format[Long] and
      (JsPath \ "adUnits").format[Seq[String]] and
      (JsPath \ "editions").format[Seq[Edition]] and
      (JsPath \ "countries").format[Seq[String]] and
      (JsPath \ "isR2Only").format[Boolean] and
      (JsPath \ "isAdTest").format[Boolean] and
      (JsPath \ "adTestValue").formatNullable[String]
    )(PageSkinSponsorship.apply, unlift(PageSkinSponsorship.unapply))
}

case class PageSkinSponsorshipReport(updatedTimeStamp: String, sponsorships: Seq[PageSkinSponsorship]) {
  val (testSponsorships, deliverableSponsorships) = sponsorships partition (_.targetsAdTest)
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

object PageSkin {

  def isValidAdUnit(adUnitPath: String): Boolean = getRelativePath(adUnitPath).isDefined

  def getRelativePath(adUnitPath: String): Option[String] = {

    def trimPath(dropFromRight: Int) = adUnitPath.split("/").drop(1).dropRight(dropFromRight).mkString("/")

    if (adUnitPath endsWith "/front/ng")
      Some(trimPath(2))
    else if (adUnitPath endsWith "/front")
      Some(trimPath(1))
    else
      None
  }


}

object PageSkinSponsorshipReportParser extends Logging {

  def apply(jsonString: String): Option[PageSkinSponsorshipReport] = {

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
