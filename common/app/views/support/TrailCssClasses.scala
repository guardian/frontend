package views.support

import model.Trail

object TrailCssClasses {
  def toneClass(trail: Trail) = {
    val tone = CardStyle(trail).toneString

    s"tone-$tone"
  }
}
