package views.support

import model.Trail

object TrailCssClasses {
  def iClockClass(trail: Trail) = {
    CardStyle(trail) match {
      case Media => "i-clock-yellow"
      case Feature => "i-clock-light-purple"
      case LiveBlog => "i-clock-light-pink"
      case _ => "i-clock-light-grey"
    }
  }
}
