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
      adTest: Option[String],
  ): Seq[LiveBlogTopSponsorship] = {
    liveBlogTopSponsorships.filter { sponsorship =>
      sponsorship.editions.contains(edition) && sponsorship.sections.contains(sectionId) && sponsorship
        .matchesTargetedAdTest(adTest)
    }
  }

  def hasLiveBlogTopAd(metadata: MetaData, request: RequestHeader): Boolean = {
    if (
      metadata.contentType == Some(DotcomContentType.LiveBlog)
    ) {
      val adTest = request.getQueryString("adtest")
      val edition = Edition(request)

      findSponsorships(edition, metadata.sectionId, adTest).nonEmpty
    } else {
      false
    }
  }
}
