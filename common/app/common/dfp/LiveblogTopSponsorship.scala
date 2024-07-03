package common.dfp

import common.{Edition, GuLogging}
import play.api.libs.json._

case class LiveBlogTopSponsorship(
    lineItemName: String,
    lineItemId: Long,
    sections: Seq[String],
    editions: Seq[Edition],
    adTest: Option[String],
    targetsAdTest: Boolean,
) {
  def hasTargetedSection(section: String): Boolean = section.isEmpty || this.sections.contains(section)

  def matchesTargetedAdTest(adTest: Option[String]): Boolean =
    if (this.targetsAdTest) { adTest == this.adTest }
    else { true }

  def nonEmpty: Boolean = sections.nonEmpty
}

object LiveBlogTopSponsorship {
  implicit val sponsorShipFormat: Format[LiveBlogTopSponsorship] = Json.format[LiveBlogTopSponsorship]
}

case class LiveBlogTopSponsorshipReport(
    updatedTimeStamp: Option[String],
    sponsorships: Seq[LiveBlogTopSponsorship],
) {
  val (testSponsorships, deliverableSponsorships) = sponsorships partition (_.targetsAdTest)
}

object LiveBlogTopSponsorshipReport {
  implicit val sponsorshipReportFormat: Format[LiveBlogTopSponsorshipReport] =
    Json.format[LiveBlogTopSponsorshipReport]
}

object LiveBlogTopSponsorshipReportParser extends GuLogging {
  def apply(jsonString: String): Option[LiveBlogTopSponsorshipReport] = {
    val json = Json.parse(jsonString)
    json.validate[LiveBlogTopSponsorshipReport] match {
      case s: JsSuccess[LiveBlogTopSponsorshipReport] => Some(s.get)
      case e: JsError                                 => log.error("Errors: " + JsError.toJson(e).toString()); None
    }
  }
}
