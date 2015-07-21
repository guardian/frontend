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

  def hasTag(tag: Tag): Boolean = tag.tagType match {
    case "keyword" => hasTagId(keywords, tag.id)
    case "series" => hasTagId(series, tag.id)
    case "contributor" => hasTagId(contributors, tag.id)
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


sealed trait TagType {
  val name: String
}

case object Series extends TagType {
  override val name: String = "series"
}

case object Keyword extends TagType {
  override val name: String = "keyword"
}


sealed trait PaidForType {
  val name: String
}

case object Sponsored extends PaidForType {
  override val name: String = "sponsoredfeatures"
}

case object AdvertisementFeature extends PaidForType {
  override val name: String = "advertisement-features"
}

case object FoundationFunded extends PaidForType {
  override val name: String = "foundation-features"
}


case class PaidForTag(targetedName: String,
                      tagType: TagType,
                      paidForType: PaidForType,
                      matchingCapiTagIds: Seq[String],
                      lineItems: Seq[GuLineItem]) {
}

object PaidForTag {

  def fromLineItems(lineItems: Seq[GuLineItem]): Seq[PaidForTag] = {

    val lineItemsGroupedByTag: Map[String, Seq[GuLineItem]] = {
      val logoLineItems = lineItems filter (_.paidForTags.nonEmpty)
      logoLineItems.foldLeft(Map.empty[String, Seq[GuLineItem]]) { case (soFar, lineItem) =>
        val lineItemTags = lineItem.paidForTags map { tag =>
          val tagLineItems = soFar.get(tag).map(_ :+ lineItem).getOrElse(Seq(lineItem))
          tag -> tagLineItems
        }
        soFar ++ lineItemTags
      }
    }

    lineItemsGroupedByTag.map { case (currTag, currLineItems) =>

      val identifyingTargets = currLineItems.head.targeting.customTargetSets.find {
        _.targets.exists(t => t.isSeriesTag || t.isKeywordTag)
      }.head.targets

      val tagType =
        if (identifyingTargets exists (_.isSeriesTag)) Series
        else Keyword

      val paidForType =
        if (identifyingTargets exists (_.isSponsoredSlot)) {
          Sponsored
        } else if (identifyingTargets exists (_.isAdvertisementFeatureSlot)) {
          AdvertisementFeature
        } else FoundationFunded

      PaidForTag(targetedName = currTag,
        tagType,
        paidForType,
        matchingCapiTagIds = CapiLookupAgent.getTagIds(tagType, currTag),
        lineItems = currLineItems)
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
