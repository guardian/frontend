package common.dfp

import model.Tag
import model.ContentType
import model.Section
import common.Edition
import play.api.mvc.RequestHeader
import model.{MetaData}
import model.DotcomContentType

trait LiveBlogTopSponsorshipAgent {

  protected def liveBlogTopSponsorships: Seq[LiveBlogTopSponsorship]

  private[dfp] def findSponsorships(
      edition: Edition,
      sectionId: String,
      keywords: Seq[Tag],
      adTest: Option[String],
  ): Seq[LiveBlogTopSponsorship] = {
    liveBlogTopSponsorships.filter { sponsorship =>
      // Section must match
      sponsorship.sections.contains(sectionId) &&
      // Edition, keywords & adtest are optional matches
      // If specified on the line item, they must match
      sponsorship.matchesEditionTargeting(edition) &&
      sponsorship.matchesKeywordTargeting(keywords) &&
      sponsorship.matchesTargetedAdTest(adTest)
    }
  }

  def hasLiveBlogTopAd(metadata: MetaData, tags: Seq[Tag], request: RequestHeader): Boolean = {
    if (metadata.contentType == Some(DotcomContentType.LiveBlog)) {
      val adTest = request.getQueryString("adtest")
      val edition = Edition(request)

      findSponsorships(edition, metadata.sectionId, tags.filter(_.isKeyword), adTest).nonEmpty
    } else {
      false
    }
  }
}
