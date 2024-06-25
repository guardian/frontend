package common.dfp

import model.Tag
import model.ContentType
import model.Section
import play.api.mvc.RequestHeader
import model.{MetaData}
import model.DotcomContentType

trait LiveBlogTopSponsorshipAgent {

  protected def liveBlogTopSponsorships: Seq[LiveBlogTopSponsorship]

  def hasLiveBlogTopAd(metadata: MetaData, request: RequestHeader): Boolean = {
    if (metadata.contentType == Some(DotcomContentType.LiveBlog)) {
      val adTest = request.getQueryString("adtest")
      liveBlogTopSponsorships.exists { sponsorship =>
        if (sponsorship.targetsAdTest) {
          sponsorship.hasTargetedSection(metadata.sectionId) && sponsorship.adTest == adTest
        } else {
          sponsorship.hasTargetedSection(metadata.sectionId)
        }
      }
    } else {
      false
    }
  }
}
