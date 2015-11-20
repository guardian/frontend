package views.support

import com.gu.facia.api.models.FaciaContent
import com.gu.facia.api.utils.CardStyle
import implicits.FaciaContentImplicits._

object TrailCssClasses {
  def toneClassFromStyle(cardStyle: CardStyle) =
    s"tone-${cardStyle.toneString}"

  def toneClass(faciaContent: FaciaContent) = toneClassFromStyle(faciaContent.cardStyle)
}
