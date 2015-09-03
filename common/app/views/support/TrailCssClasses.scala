package views.support

import com.gu.facia.api.models.FaciaContent
import com.gu.facia.api.utils.CardStyle
import implicits.FaciaContentImplicits._
import model.Content

object TrailCssClasses {
  def toneClassFromStyle(cardStyle: CardStyle) =
    s"tone-${cardStyle.toneString}"

  def toneClass(content: Content) = toneClassFromStyle(CardStyle.fromContent(content.delegate))

  def articleToneClass(content: Content) = toneClass(content)

  def toneClass(faciaContent: FaciaContent) = toneClassFromStyle(faciaContent.cardStyle)

  def articleToneClass(faciaContent: FaciaContent) = toneClass(faciaContent)
}
