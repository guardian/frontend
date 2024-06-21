package common.dfp

import model.Tag
import model.ContentType
import model.Section

trait HasLiveblogAdComponentAgent {

  protected def liveBlogTopTargetedSections: Set[Section]
  protected def liveBlogTopTargetedContentTypes: Set[ContentType]

  def hasLiveblogAd(contentType: ContentType, section: Section): Boolean = {
    liveBlogTopTargetedSections.contains(section) && liveBlogTopTargetedContentTypes.contains(contentType)
  }
}
