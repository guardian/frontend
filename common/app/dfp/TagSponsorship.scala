package dfp

import common.Logging
import model.Tag
import play.api.libs.functional.syntax._
import play.api.libs.json._


case class Sponsorship(tags: Seq[String], sponsor: Option[String]) {

  def hasTag(tagId: String): Boolean = tags contains tagId.split('/').last
}


case class InlineMerchandisingTagSet(keywords: Set[String] = Set.empty, series: Set[String] = Set.empty, contributors: Set[String] = Set.empty) {

  private def hasTagId(tags: Set[String], tagId: String): Boolean = tags contains tagId.split('/').last

  def hasTag(tag: Tag): Boolean = tag.tagType match {
    case "keyword" => hasTagId(keywords, tag.id)
    case "series" => hasTagId(series, tag.id)
    case "contributor" => hasTagId(contributors, tag.id)
    case _ => false
  }

  def nonEmpty: Boolean = keywords.nonEmpty || series.nonEmpty || contributors.nonEmpty
}


case class SponsorshipReport(updatedTimeStamp: String, sponsorships: Seq[Sponsorship])


object SponsorshipReportParser extends Logging {

  def apply(jsonString: String) = {
    implicit val sponsorshipReads: Reads[Sponsorship] = (
      (JsPath \ "tags").read[Seq[String]] and
        (JsPath \ "sponsor").read[Option[String]]
      )(Sponsorship.apply _)

    implicit val sponsorshipReportReads: Reads[SponsorshipReport] = (
      (JsPath \ "updatedTimeStamp").read[String] and
        (JsPath \ "sponsorships").read[Seq[Sponsorship]]
      )(SponsorshipReport.apply _)


    val result: JsResult[SponsorshipReport] = Json.parse(jsonString).validate[SponsorshipReport]
    result match {
      case s: JsSuccess[SponsorshipReport] => Some(s.get)
      case e: JsError => log.error("Errors: " + JsError.toFlatJson(e).toString()); None
    }
  }
}


case class InlineMerchandisingTargetedTagsReport(updatedTimeStamp: String, targetedTags: InlineMerchandisingTagSet)


object InlineMerchandisingTargetedTagsReportParser extends Logging {

  private implicit val inlineMerchandisingTagSetReads: Reads[InlineMerchandisingTagSet] = (
    (JsPath \ "keywords").read[Set[String]] and
      (JsPath \ "series").read[Set[String]] and
      (JsPath \ "contributors").read[Set[String]]
    )(InlineMerchandisingTagSet.apply _)

  private implicit val inlineMerchandisingTargetedTagsReportReads: Reads[InlineMerchandisingTargetedTagsReport] = (
    (JsPath \ "updatedTimeStamp").read[String] and
      (JsPath \ "targetedTags").read[InlineMerchandisingTagSet]
    )(InlineMerchandisingTargetedTagsReport.apply _)

  def apply(jsonString: String): Option[InlineMerchandisingTargetedTagsReport] = {
    val json = Json.parse(jsonString)
    json.validate[InlineMerchandisingTargetedTagsReport] match {
      case s: JsSuccess[InlineMerchandisingTargetedTagsReport] => Some(s.get)
      case e: JsError => log.error("Errors: " + JsError.toFlatJson(e).toString()); None
    }
  }
}
