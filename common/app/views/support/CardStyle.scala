package views.support

import common.ExternalLinks
import model.Trail

object CardStyle {
  def isExternalLink(trail: Trail): Boolean = (for {
    snapType <- trail.snapType
    href <- trail.faciaUrl
  } yield snapType == "link" && ExternalLinks.external(href)) getOrElse false

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

sealed trait CardStyle {
  def toneString: String
}

case object SpecialReport extends CardStyle {
  override def toneString: String = "special-report"
}

case object LiveBlog extends CardStyle {
  override def toneString: String = "live"
}

case object DeadBlog extends CardStyle {
  override def toneString: String = "dead"
}

case object Feature extends CardStyle {
  override def toneString: String = "feature"
}

case object Editorial extends CardStyle {
  override def toneString: String = "editorial"
}

case object Comment extends CardStyle {
  override def toneString: String = "comment"
}

case object Podcast extends CardStyle {
  override def toneString: String = "podcast"
}

case object Media extends CardStyle {
  override def toneString: String = "media"
}

case object Analysis extends CardStyle {
  override def toneString: String = "analysis"
}

case object Review extends CardStyle {
  override def toneString: String = "review"
}

case object Letters extends CardStyle {
  override def toneString: String = "letters"
}

case object ExternalLink extends CardStyle {
  override def toneString: String = "external"
}

case object Default extends CardStyle {
  override def toneString: String = "news"
}
