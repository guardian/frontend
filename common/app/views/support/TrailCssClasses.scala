package views.support

import com.gu.facia.api.models.FaciaContent
import com.gu.facia.api.utils.CardStyle
import model.Trail
import com.gu.facia.api.utils.FaciaContentImplicits._

object TrailCssClasses {
  def toneClassFromStyle(cardStyle: CardStyle) =
    s"tone-${cardStyle.toneString}"

  def toneClass(trail: Trail) = toneClassFromStyle(CardStyleForFrontend(trail))

  def articleToneClass(trail: Trail) = toneClass(trail)

  def toneClass(faciaContent: FaciaContent) = toneClassFromStyle(faciaContent.cardStyle)

  def articleToneClass(faciaContent: FaciaContent) = toneClass(faciaContent)
}
