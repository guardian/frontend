package views.support

import model.Trail

object TrailCssClasses {
  def toneClassFromStyle(cardStyle: CardStyle) =
    s"tone-${cardStyle.toneString}"

  def toneClass(trail: Trail) = toneClassFromStyle(CardStyle(trail))

  def articleToneClass(trail: Trail) = toneClass(trail)
}
