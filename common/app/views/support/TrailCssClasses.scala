package views.support

import model.Trail

object TrailCssClasses {
  def toneClass(trail: Trail) = {
    val tone = CardStyle(trail) match {
      case Media => "media"
      case Comment => "comment"
      case LiveBlog => "live"
      case DeadBlog => "dead"
      case Feature => "feature"
      case Analysis => "analysis"
      case Review => "review"
      case Podcast => "podcast"
      case _ => "news"
    }

    s"tone-$tone"
  }

  /** Article will soon support all tone classes so we'll be able to remove this silliness */
  val SupportedArticleTones: Set[CardStyle] = Set(
    Media,
    Comment,
    LiveBlog,
    DeadBlog,
    Feature
  )

  def articleToneClass(trail: Trail) = {
    if (SupportedArticleTones.contains(CardStyle(trail))) {
      toneClass(trail)
    } else {
      "tone-news"
    }
  }
}
