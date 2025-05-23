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
  def matchesTargetedAdTest(adTest: Option[String]): Boolean = {
    if (this.targetsAdTest) {
      // If the sponsorship targets an adtest, check if it matches
      adTest == this.adTest
    } else {
      // If no adtest targeting, return true
      true
    }
  }

  def matchesEditionTargeting(edition: Edition) = {
    if (this.editions.nonEmpty) {
      // If the sponsorship targets an edition, check if it matches
      this.editions.exists(_.id == edition.id)
    } else {
      // If no edition targeting, return true
      true
    }
  }

  def matchesKeywordTargeting(keywordTags: Seq[Tag]) = {
    if (this.keywords.nonEmpty) {
      // If the sponsorship targets a keyword, check if it matches
      keywordTags exists { tag: Tag =>
        tag.isKeyword && matchesTag(this.keywords, tag.id)
      }
    } else {
      // If no keyword targeting, return true
      true
    }
  }

  private def matchesTag(tags: Seq[String], tagId: String): Boolean =
    tagId.split("/").lastOption exists { endPart =>
      tags contains endPart
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
