package views.support

import model.Trail

object TrailCssClasses {
  def iClockClass(trail: Trail) = {
    CardStyle(trail) match {
      case Media => "i-clock-yellow"
      case Feature => "i-clock-light-pink"
      case LiveBlog => "i-clock-light-pink"
      case _ => "i-clock-light-grey"
    }
  }

  def toneClass(trail: Trail) = {
    CardStyle(trail) match {
      case Media => "tone-media"
      case Comment => "tone-comment"
      case LiveBlog => "tone-live"
      case Feature => "tone-feature"
      case Analysis => "tone-analysis"
      case _ => "tone-news"
    }
  }
}
