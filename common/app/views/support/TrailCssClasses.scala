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
      case _ => "news"
    }

    s"tone-$tone"
  }
}
