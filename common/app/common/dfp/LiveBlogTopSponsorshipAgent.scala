package common.dfp

import model.Tag
import model.ContentType
import model.Section
import common.Edition
import play.api.mvc.RequestHeader
import model.{MetaData}
import model.DotcomContentType
import conf.switches.Switches.{LiveBlogTopSponsorshipSwitch}

trait LiveBlogTopSponsorshipAgent {

  protected def liveBlogTopSponsorships: Seq[LiveBlogTopSponsorship]

  private[dfp] def findSponsorships(
      edition: Edition,
      sectionId: String,
      keywords: Seq[Tag],
      adTest: Option[String],
  ): Seq[LiveBlogTopSponsorship] = {
    liveBlogTopSponsorships.filter { sponsorship =>
      sponsorship.editions.contains(edition) && sponsorship.sections.contains(
        sectionId,
      ) && (keywords exists sponsorship.hasTag) && sponsorship
        .matchesTargetedAdTest(adTest)
    }
  }

  def hasLiveBlogTopAd(metadata: MetaData, tags: Seq[Tag], request: RequestHeader): Boolean = {
    if (metadata.contentType == Some(DotcomContentType.LiveBlog) && LiveBlogTopSponsorshipSwitch.isSwitchedOn) {
      val adTest = request.getQueryString("adtest")
      val edition = Edition(request)

      findSponsorships(edition, metadata.sectionId, tags, adTest).nonEmpty
    } else {
      false
    }
  }
}
