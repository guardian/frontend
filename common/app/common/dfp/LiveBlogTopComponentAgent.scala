package common.dfp

import model.Tag
import model.ContentType
import model.Section
import play.api.mvc.RequestHeader

trait LiveBlogTopAdComponentAgent {

  protected def liveBlogTopSponsorships: Seq[LiveBlogTopSponsorship]

  def hasLiveBlogTopAd(isLiveBlog: Boolean, sectionId: String, request: RequestHeader): Boolean = {
    if(isLiveBlog) {
      val adTest = request.getQueryString("adtest")
      liveBlogTopSponsorships.exists { sponsorship =>
        if(sponsorship.targetsAdTest) {
          sponsorship.hasTargetedSection(sectionId) && sponsorship.adTest == adTest
        } else {
          sponsorship.hasTargetedSection(sectionId)
        }
      }
    } else {
      false
    }
  }
}
