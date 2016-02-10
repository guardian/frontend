package common.dfp

import common.Logging
import model.Tag
import play.api.libs.functional.syntax._
import play.api.libs.json.Reads._
import play.api.libs.json._


object InlineMerchandisingTagSet {
  implicit val jsonReads = Json.reads[InlineMerchandisingTagSet]

  implicit val inlineMerchandisingTagSetWrites = new Writes[InlineMerchandisingTagSet] {
    def writes(tagSet: InlineMerchandisingTagSet): JsValue = {
      Json.obj(
        "keywords" -> tagSet.keywords,
        "series" -> tagSet.series,
        "contributors" -> tagSet.contributors
      )
    }
  }

}

case class InlineMerchandisingTagSet(keywords: Set[String] = Set.empty, series: Set[String] = Set.empty, contributors: Set[String] = Set.empty) {

  private def hasTagId(tags: Set[String], tagId: String): Boolean = tagId.split('/').lastOption exists { endPart =>
    tags contains endPart
  }

  def hasTag(tag: Tag): Boolean = tag.properties.tagType match {
    case "Keyword" => hasTagId(keywords, tag.id)
    case "Series" => hasTagId(series, tag.id)
    case "Contributor" => hasTagId(contributors, tag.id)
    case _ => false
  }

  def nonEmpty: Boolean = keywords.nonEmpty || series.nonEmpty || contributors.nonEmpty
}


object InlineMerchandisingTargetedTagsReport {
  implicit val jsonReads = Json.reads[InlineMerchandisingTargetedTagsReport]

  implicit val inlineMerchandisingTargetedTagsReportWrites =
    new Writes[InlineMerchandisingTargetedTagsReport] {
      def writes(report: InlineMerchandisingTargetedTagsReport): JsValue = {
        Json.obj(
          "updatedTimeStamp" -> report.updatedTimeStamp,
          "targetedTags" -> report.targetedTags
        )
      }
    }
}

case class InlineMerchandisingTargetedTagsReport(updatedTimeStamp: String, targetedTags: InlineMerchandisingTagSet)


object InlineMerchandisingTargetedTagsReportParser extends Logging {
  def apply(jsonString: String): Option[InlineMerchandisingTargetedTagsReport] = {
    val json = Json.parse(jsonString)
    json.validate[InlineMerchandisingTargetedTagsReport] match {
      case s: JsSuccess[InlineMerchandisingTargetedTagsReport] => Some(s.get)
      case e: JsError => log.error("Errors: " + JsError.toJson(e).toString()); None
    }
  }
}


sealed abstract class TagType(val name: String)
case object Series extends TagType("series")
case object Keyword extends TagType("keyword")


sealed abstract class PaidForType(val name: String)
case object Sponsored extends PaidForType("sponsoredfeatures")
case object AdvertisementFeature extends PaidForType("advertisement-features")
case object FoundationFunded extends PaidForType("foundation-features")


case class PaidForTag(targetedName: String,
                      tagType: TagType,
                      paidForType: PaidForType,
                      matchingCapiTagIds: Seq[String],
                      lineItems: Seq[GuLineItem]) {
}

object PaidForTag {

  def fromLineItems(lineItems: Seq[GuLineItem]): Seq[PaidForTag] = {

    val lineItemsGroupedByTag: Map[PaidForTag, Seq[GuLineItem]] = {
      val logoLineItems = lineItems filterNot (_.isExpired) filter (_.paidForTags.nonEmpty)
      logoLineItems.foldLeft(Map.empty[PaidForTag, Seq[GuLineItem]]) { case (soFar, lineItem) =>
        val lineItemTags = lineItem.paidForTags map { tag =>
          val tagLineItems = soFar.get(tag).map(_ :+ lineItem).getOrElse(Seq(lineItem))
          tag -> tagLineItems
        }
        soFar ++ lineItemTags
      }
    }

    lineItemsGroupedByTag.map { case (currTag, currLineItems) =>
      currTag.copy(
        matchingCapiTagIds = CapiLookupAgent.getTagIds(currTag.tagType, currTag.targetedName),
        lineItems = currLineItems
      )
    }.toList.sortBy(_.targetedName)
  }

  implicit val jsonWrites = new Writes[PaidForTag] {
    override def writes(tag: PaidForTag): JsValue = {
      Json.obj(
        "targetedName" -> tag.targetedName,
        "tagType" -> tag.tagType.name,
        "paidForType" -> tag.paidForType.name,
        "matchingCapiTagIds" -> tag.matchingCapiTagIds,
        "lineItems" -> tag.lineItems
      )
    }
  }

  implicit val jsonReads: Reads[PaidForTag] = (
    (JsPath \ "targetedName").read[String] and
      (JsPath \ "tagType").read[String].map {
        case Series.name => Series
        case Keyword.name => Keyword
      } and
      (JsPath \ "paidForType").read[String].map {
        case Sponsored.name => Sponsored
        case AdvertisementFeature.name => AdvertisementFeature
        case FoundationFunded.name => FoundationFunded
      } and
      (JsPath \ "matchingCapiTagIds").read[Seq[String]] and
      (JsPath \ "lineItems").read[Seq[GuLineItem]]
    )(PaidForTag.apply _)
}


case class PaidForTagsReport(updatedTimeStamp: String, paidForTags: Seq[PaidForTag]) {

  private def subset(paidForType: PaidForType, tagType: TagType) = {
    paidForTags filter { tag =>
      tag.paidForType == paidForType && tag.tagType == tagType
    }
  }

  val sponsoredSeries: Seq[PaidForTag] = subset(Sponsored, Series)
  val sponsoredKeywords: Seq[PaidForTag] = subset(Sponsored, Keyword)

  val advertisementFeatureSeries: Seq[PaidForTag] = subset(AdvertisementFeature, Series)
  val advertisementFeatureKeywords: Seq[PaidForTag] = subset(AdvertisementFeature, Keyword)

  val foundationFundedSeries: Seq[PaidForTag] = subset(FoundationFunded, Series)
  val foundationFundedKeywords: Seq[PaidForTag] = subset(FoundationFunded, Keyword)
}

object PaidForTagsReport {

  implicit val jsonWrites = new Writes[PaidForTagsReport] {
    override def writes(report: PaidForTagsReport): JsValue = {
      Json.obj(
        "updatedTimeStamp" -> report.updatedTimeStamp,
        "paidForTags" -> report.paidForTags
      )
    }
  }

  implicit val jsonReads = Json.reads[PaidForTagsReport]
}
