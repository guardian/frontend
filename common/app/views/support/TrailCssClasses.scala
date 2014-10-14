package views.support

import model.Trail

object TrailCssClasses {
  def toneClass(trail: Trail) = {
    val tone = CardStyle(trail) match {
      case Analysis => "analysis"
      case Comment => "comment"
      case Editorial => "editorial"
      case Feature => "feature"
      case Review => "review"
      case LiveBlog => "live"
      case DeadBlog => "dead"
      case Media => "media"
      case Podcast => "podcast"
      case _ => "news"
    }

    s"tone-$tone"
  }

  /** Article will soon support all tone classes so we'll be able to remove this silliness */
  val SupportedArticleTones: Set[CardStyle] = Set(
    Analysis,
    Comment,
    Editorial,
    Feature,
    Review,
    LiveBlog,
    DeadBlog,
    Media
  )

  def articleToneClass(trail: Trail) = {
    if (SupportedArticleTones.contains(CardStyle(trail))) {
      toneClass(trail)
    }
  }
}
