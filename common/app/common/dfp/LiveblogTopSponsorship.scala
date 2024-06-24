package common.dfp

import common.{Edition, GuLogging}
import play.api.libs.json._

object LiveBlogTopSponsorship {
  implicit val jsonReads: Reads[LiveBlogTopSponsorship] = Json.reads[LiveBlogTopSponsorship]

  implicit val LiveBlogTopSponsorshipWrites: Writes[LiveBlogTopSponsorship] =
    (targeting: LiveBlogTopSponsorship) => {
      Json.obj(
        "section" -> targeting.sections,
      )
    }

}

case class LiveBlogTopSponsorship(
    sections: Set[String] = Set.empty,
) {

  def hasTargetedSection(section: String): Boolean = section.isEmpty || this.sections.contains(section)

  def hasLiveBlogTopSponsorship(targetedSection: String): Boolean =
    hasTargetedSection(targetedSection)

  def nonEmpty: Boolean = sections.nonEmpty
}

object LiveBlogTopLineItem {
  implicit val jsonReads: Reads[LiveBlogTopLineItem] = Json.reads[LiveBlogTopLineItem]

  implicit val liveblogTopLineItemWrites: Writes[LiveBlogTopLineItem] =
    (lineItem: LiveBlogTopLineItem) => {
      Json.obj(
        "name" -> lineItem.name,
        "id" -> lineItem.id,
      )
    }
}

case class LiveBlogTopLineItem(
    name: String,
    id: Long,
) {}

object LiveBlogTopLineItems {
  implicit val lineItemFormat: OFormat[LiveBlogTopLineItem] = Json.format[LiveBlogTopLineItem]
  implicit val lineItemsFormat: OFormat[LiveBlogTopLineItems] = Json.format[LiveBlogTopLineItems]
}

case class LiveBlogTopLineItems(items: Seq[LiveBlogTopLineItem] = Seq.empty) {
  val sortedItems = items.sortBy(_.name)
}

object LiveBlogTopTargetingReport {
  implicit val jsonReads: Reads[LiveBlogTopTargetingReport] =
    Json.reads[LiveBlogTopTargetingReport]

  implicit val liveBlogTopTargetingReportWrites: Writes[LiveBlogTopTargetingReport] =
    (report: LiveBlogTopTargetingReport) => {
      Json.obj(
        "updatedTimeStamp" -> report.updatedTimeStamp,
        "targetedSections" -> report.targetedSections,
        "lineItems" -> report.lineItems,
      )
    }
}

case class LiveBlogTopTargetingReport(
    updatedTimeStamp: Option[String],
    targetedSections: Set[String],
    lineItems: LiveBlogTopLineItems,
)

object LiveBlogTopTargetingReportParser extends GuLogging {
  def apply(jsonString: String): Option[LiveBlogTopTargetingReport] = {
    val json = Json.parse(jsonString)
    json.validate[LiveBlogTopTargetingReport] match {
      case s: JsSuccess[LiveBlogTopTargetingReport] => Some(s.get)
      case e: JsError => log.error("Errors: " + JsError.toJson(e).toString()); None
    }
  }
}
