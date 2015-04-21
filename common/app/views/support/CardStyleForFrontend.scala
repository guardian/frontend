package views.support

import com.gu.facia.api.models.FaciaContent
import com.gu.facia.api.utils._
import common.ExternalLinks
import model.Trail
import com.gu.facia.api.utils.FaciaContentImplicits._

object CardStyleForFrontend {
  def isExternalLink(trail: Trail): Boolean = (for {
    snapType <- trail.snapType
    href <- trail.faciaUrl
  } yield snapType == "link" && ExternalLinks.external(href)) getOrElse false

  def isExternalLink(faciaContent: FaciaContent): Boolean = (for {
    snapType <- faciaContent.embedType
    href <- Option(faciaContent.href)
  } yield snapType == "link" && href.exists(ExternalLinks.external)) getOrElse false

  def apply(trail: Trail): CardStyle = {
    if (isExternalLink(trail)) {
      ExternalLink
    } else if (trail.tags.exists(_.id == "news/series/hsbc-files")) {
      SpecialReport
    } else if (trail.isLiveBlog) {
      if (trail.isLive) {
        LiveBlog
      } else {
        DeadBlog
      }
    } else if (trail.isPodcast) {
      Podcast
    } else if (trail.isMedia) {
      Media
    } else if (trail.isEditorial) {
      Editorial
    } else if (trail.isComment) {
      Comment
    } else if (trail.isAnalysis) {
      Analysis
    } else if (trail.isReview) {
      Review
    } else if (trail.isLetters) {
      Letters
    } else if (trail.isFeature) {
      Feature
    } else {
      Default
    }
  }
}
