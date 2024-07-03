package common.dfp

import model.Tag
import model.ContentType
import model.Section
import common.Edition
import play.api.mvc.RequestHeader
import model.{MetaData}
import model.DotcomContentType
import experiments.{ActiveExperiments, LiveBlogTopSponsorship}

trait LiveBlogTopSponsorshipAgent {

  protected def liveBlogTopSponsorships: Seq[LiveBlogTopSponsorship]

  private[dfp] def findSponsorships(edition: Edition): Seq[LiveBlogTopSponsorship] = {
    liveBlogTopSponsorships.filter { sponsorship =>
      sponsorship.editions.isEmpty || sponsorship.editions.contains(edition)
    }
  }

  def hasLiveBlogTopAd(metadata: MetaData, request: RequestHeader): Boolean = {
    if (
      metadata.contentType == Some(DotcomContentType.LiveBlog) && ActiveExperiments.isParticipating(
        LiveBlogTopSponsorship,
      )(request)
    ) {
      val adTest = request.getQueryString("adtest")
      val edition = Edition(request)

      findSponsorships(edition).exists { sponsorship =>
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
