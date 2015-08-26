package views.support

import com.gu.facia.api.utils._
import model.Trail

object CardStyleForFrontend {
  def apply(trail: Trail): CardStyle = {
    if (trail.tags.exists(_.id == "news/series/hsbc-files") || trail.tags.exists(_.id == "us-news/series/counted-us-police-killings")) {
      SpecialReport
    } else if (trail.isLiveBlog) {
      if (trail.isLive) {
        LiveBlog
      } else {
        DeadBlog
      }
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
      DefaultCardstyle
    }
  }
}
