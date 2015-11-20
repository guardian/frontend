package views.support

import com.gu.facia.api.models.FaciaContent
import com.gu.facia.api.utils.CardStyle
import implicits.FaciaContentImplicits.FaciaContentImplicit

object TrailCssClasses {
  def toneClassFromStyle(cardStyle: CardStyle) =
    s"tone-${cardStyle.toneString}"

  def toneClass(content: model.Content) = toneClassFromStyle(content.cardStyle)
  def toneClass(item: model.ContentType) = toneClassFromStyle(item.content.cardStyle)
  def toneClass(faciaContent: FaciaContent) = toneClassFromStyle(faciaContent.cardStyle)
}
