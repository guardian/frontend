package views.support

import model.Trail

object CardStyle {
  def apply(trail: Trail): CardStyle = {
    if (trail.isLiveBlog) {
      LiveBlog
    } else if (trail.isPodcast) {
      Podcast
    } else if (trail.isMedia) {
      Media
    } else if (trail.isComment) {
      Comment
    } else if (trail.isAnalysis) {
      Analysis
    } else if (trail.isFeature) {
      Feature
    } else {
      Default
    }
  }
}

sealed trait CardStyle

case object LiveBlog extends CardStyle
case object Feature extends CardStyle
case object Comment extends CardStyle
case object Podcast extends CardStyle
case object Media extends CardStyle
case object Analysis extends CardStyle
case object Default extends CardStyle
