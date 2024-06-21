package common.dfp

import common.{Edition, GuLogging}
import play.api.libs.json._

object LiveBlogTopSponsorship {
  implicit val jsonReads: Reads[LiveBlogTopSponsorship] = Json.reads[LiveBlogTopSponsorship]

  implicit val LiveBlogTopSponsorshipWrites: Writes[LiveBlogTopSponsorship] =
    (targeting: LiveBlogTopSponsorship) => {
      Json.obj(
        "contentTypes" -> targeting.contentTypes,
        "section" -> targeting.sections,
      )
    }

}

case class LiveBlogTopSponsorship(
    contentTypes: Set[String] = Set.empty,
    sections: Set[String] = Set.empty,
) {

  def hasTargetedSection(section: String): Boolean = section.isEmpty || this.sections.contains(section)

  def hasTargetedContentType(contentType: String): Boolean = contentType.isEmpty || this.contentTypes.contains(contentType)

  def hasLiveBlogTopSponsorship(targetedSection: String, targetedContentType: String): Boolean =
    hasTargetedSection(targetedSection) && hasTargetedContentType(targetedContentType)

  def nonEmpty: Boolean = contentTypes.nonEmpty || sections.nonEmpty
}

object LiveblogTopLineItem {
  implicit val jsonReads: Reads[LiveblogTopLineItem] = Json.reads[LiveblogTopLineItem]

  implicit val liveblogTopLineItemWrites: Writes[LiveblogTopLineItem] =
    (lineItem: LiveblogTopLineItem) => {
      Json.obj(
        "name" -> lineItem.name,
        "id" -> lineItem.id,
        "targetedSections" -> lineItem.targetedSections,
        "targetedContentTypes" -> lineItem.targetedContentTypes,
      )
    }
}

case class LiveblogTopLineItem(
    name: String,
    id: Long,
    targetedSections: Set[String] = Set.empty,
    targetedContentTypes: Set[String] = Set.empty,
) {}

object LiveblogTopLineItems {
  implicit val lineItemFormat: OFormat[LiveblogTopLineItem] = Json.format[LiveblogTopLineItem]
  implicit val lineItemsFormat: OFormat[LiveblogTopLineItems] = Json.format[LiveblogTopLineItems]
}

case class LiveblogTopLineItems(items: Seq[LiveblogTopLineItem] = Seq.empty) {
  val sortedItems = items.sortBy(_.name)
}

object LiveblogTopTargetingReport {
  implicit val jsonReads: Reads[LiveblogTopTargetingReport] =
    Json.reads[LiveblogTopTargetingReport]

  implicit val liveblogTopTargetingReportWrites: Writes[LiveblogTopTargetingReport] =
    (report: LiveblogTopTargetingReport) => {
      Json.obj(
        "updatedTimeStamp" -> report.updatedTimeStamp,
        "targetedSections" -> report.targetedSections,
        "targetedContentTypes" -> report.targetedContentTypes,
        "lineItems" -> report.lineItems,
      )
    }
}

case class LiveblogTopTargetingReport(
    updatedTimeStamp: String,
    targetedSections: Set[String],
    targetedContentTypes: Set[String],
    lineItems: LiveblogTopLineItems,
)

object LiveblogTopTargetingReportParser extends GuLogging {
  def apply(jsonString: String): Option[LiveblogTopTargetingReport] = {
    val json = Json.parse(jsonString)
    json.validate[LiveblogTopTargetingReport] match {
      case s: JsSuccess[LiveblogTopTargetingReport] => Some(s.get)
      case e: JsError => log.error("Errors: " + JsError.toJson(e).toString()); None
    }
  }
}
