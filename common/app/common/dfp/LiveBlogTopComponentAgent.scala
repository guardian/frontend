package common.dfp

import model.Tag
import model.ContentType
import model.Section

trait LiveBlogTopAdComponentAgent {

  protected def liveBlogTopTargetedSections: LiveBlogTopSponsorship

  def hasLiveBlogTopAd(isLiveBlog: Boolean, sectionId: String): Boolean = {
    liveBlogTopTargetedSections.hasLiveBlogTopSponsorship(sectionId) && isLiveBlog
  }
}
