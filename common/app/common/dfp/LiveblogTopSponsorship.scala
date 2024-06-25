package common.dfp

import common.{Edition, GuLogging}
import play.api.libs.json._

// object LiveBlogTopSponsorship {
//   implicit val jsonReads: Reads[LiveBlogTopSponsorship] = Json.reads[LiveBlogTopSponsorship]

//   implicit val LiveBlogTopSponsorshipWrites: Writes[LiveBlogTopSponsorship] =
//     (targeting: LiveBlogTopSponsorship) => {
//       Json.obj(
//         "section" -> targeting.sections,
//         "adTests" -> targeting.adTests,
//       )
//     }

// }

// case class LiveBlogTopSponsorship(
//     sections: Set[String] = Set.empty,
//     adTests: Set[String] = Set.empty
// ) {

//   def hasTargetedSection(section: String): Boolean = section.isEmpty || this.sections.contains(section)

//   def hasTargetedAdTest(adTest: String): Boolean = this.adTests.contains(adTest)

//   def nonEmpty: Boolean = sections.nonEmpty
// }

// object LiveBlogTopLineItem {
//   implicit val jsonReads: Reads[LiveBlogTopLineItem] = Json.reads[LiveBlogTopLineItem]

//   implicit val liveblogTopLineItemWrites: Writes[LiveBlogTopLineItem] =
//     (lineItem: LiveBlogTopLineItem) => {
//       Json.obj(
//         "name" -> lineItem.name,
//         "id" -> lineItem.id,
//         "adTest" -> lineItem.adTest
//       )
//     }
// }

case class LiveBlogTopSponsorship(
    lineItemName: String,
    lineItemId: Long,
    sections: Set[String],
    adTest: Option[String],
    targetsAdTest: Boolean,
) {
  def hasTargetedSection(section: String): Boolean = section.isEmpty || this.sections.contains(section)

  def hasTargetedAdTest(adTest: String): Boolean = this.adTest == Some(adTest)

  def nonEmpty: Boolean = sections.nonEmpty
}

object LiveBlogTopSponsorship {
  implicit val sponsorShipFormat: Format[LiveBlogTopSponsorship] = Json.format[LiveBlogTopSponsorship]
}

// object LiveBlogTopSponsorships {
//   implicit val lineItemFormat: OFormat[LiveBlogTopSponsorship] = Json.format[LiveBlogTopSponsorship]
//   implicit val lineItemsFormat: OFormat[LiveBlogTopSponsorships] = Json.format[LiveBlogTopSponsorships]
// }

// case class LiveBlogTopSponsorships(items: Seq[LiveBlogTopSponsorship] = Seq.empty) {
//   val sortedItems = items.sortBy(_.lineItemName)
// }

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
