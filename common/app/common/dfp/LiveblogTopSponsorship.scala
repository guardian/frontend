package common.dfp

import common.{Edition, GuLogging}
import play.api.libs.json._
import model.Tag

case class LiveBlogTopSponsorship(
    lineItemName: String,
    lineItemId: Long,
    sections: Seq[String],
    editions: Seq[Edition],
    keywords: Seq[String],
    adTest: Option[String],
    targetsAdTest: Boolean,
) {
  def matchesTargetedAdTest(adTest: Option[String]): Boolean =
    if (this.targetsAdTest) { adTest == this.adTest }
    else { true }

  private def hasTagId(tags: Seq[String], tagId: String): Boolean =
    tagId.split('/').lastOption exists { endPart =>
      tags contains endPart
    }

  def hasTag(tag: Tag): Boolean =
    tag.properties.tagType match {
      case "Keyword" => hasTagId(keywords, tag.id)
      case _         => false
    }
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
