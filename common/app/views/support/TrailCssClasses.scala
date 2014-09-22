package views.support

import model.Trail

object TrailCssClasses {
  private def svgClass(trail: Trail, imageName: String) = {
    val colour = CardStyle(trail) match {
      case Media => "yellow"
      case Feature => "light-pink"
      case LiveBlog => "light-pink"
      case _ => "light-grey"
    }

    s"i-$imageName-$colour"
  }

  def iClockClass(trail: Trail) = svgClass(trail, "clock")
  def commentCountClass(trail: Trail) = svgClass(trail, "comment")

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
