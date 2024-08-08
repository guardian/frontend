package common.dfp

import common.{Edition, GuLogging}
import model.Tag
import play.api.libs.json._

object HighMerchandisingLineItems {
  implicit val lineItemFormat: OFormat[HighMerchandisingLineItem] = Json.format[HighMerchandisingLineItem]
  implicit val lineItemsFormat: OFormat[HighMerchandisingLineItems] = Json.format[HighMerchandisingLineItems]
}

case class HighMerchandisingLineItems(items: Seq[HighMerchandisingLineItem] = Seq.empty) {
  val sortedItems = items.sortBy(_.name)
}

case class HighMerchandisingLineItem(
    name: String,
    id: Long,
    tags: Seq[String],
    adUnitsIncluded: Seq[GuAdUnit],
    adUnitsExcluded: Seq[GuAdUnit],
    customTargetSet: Seq[CustomTargetSet],
) {

  val customTargets = customTargetSet.flatMap(_.targets)
  val editions = customTargets.filter(_.name == "edition").flatMap(_.values).distinct
  val urls = customTargets.filter(_.name == "url").flatMap(_.values).distinct
  val isRunOfNetwork =
    adUnitsIncluded.isEmpty || (adUnitsIncluded.exists(_.isRunOfNetwork) && adUnitsIncluded.size == 1)
  val hasUnknownTarget = isRunOfNetwork && editions.isEmpty && urls.isEmpty && tags.isEmpty

  // Returns true if the metadata parameters explicitly match the lineItem.
  def matchesPageTargeting(adUnitSuffix: String, pageTags: Seq[Tag], edition: Edition, pagePath: String): Boolean = {

    val cleansedPageEdition = edition.id.toLowerCase
    val cleansedPageTagNames = pageTags map (_.name.replaceAll(" ", "-").toLowerCase)

    val matchesAdUnit = adUnitsIncluded.isEmpty || adUnitsIncluded.exists(_.path contains adUnitSuffix)
    val matchesTag = cleansedPageTagNames.isEmpty || cleansedPageTagNames.exists(tags.contains)
    val matchesEdition = editions.isEmpty || editions.contains(cleansedPageEdition)
    val matchesUrl = urls.isEmpty || urls.contains(pagePath)

    // High-merch line items must be explicitly targeted to something, so if there is no kind of targeting,
    // then the match fails.
    matchesAdUnit && matchesTag && matchesEdition && matchesUrl && !hasUnknownTarget
  }
}

object HighMerchandisingTargetedTagsReport {
  implicit val jsonFormat: OFormat[HighMerchandisingTargetedTagsReport] =
    Json.format[HighMerchandisingTargetedTagsReport]
}

case class HighMerchandisingTargetedTagsReport(updatedTimeStamp: String, lineItems: HighMerchandisingLineItems)

object HighMerchandisingTargetedTagsReportParser extends GuLogging {
  def apply(jsonString: String): Option[HighMerchandisingTargetedTagsReport] = {
    val json = Json.parse(jsonString)
    json.validate[HighMerchandisingTargetedTagsReport] match {
      case s: JsSuccess[HighMerchandisingTargetedTagsReport] => Some(s.get)
      case e: JsError => log.error("Errors: " + JsError.toJson(e).toString()); None
    }
  }
}
