package views.support

import com.gu.facia.api.models.FaciaContent
import model.Trail

object TrailCssClasses {
  def toneClassFromStyle(cardStyle: CardStyle) =
    s"tone-${cardStyle.toneString}"

  def toneClass(trail: Trail) = toneClassFromStyle(CardStyle(trail))

  def articleToneClass(trail: Trail) = toneClass(trail)

  def toneClass(faciaContent: FaciaContent) = toneClassFromStyle(CardStyle(faciaContent))

  def articleToneClass(faciaContent: FaciaContent) = toneClass(faciaContent)
}
