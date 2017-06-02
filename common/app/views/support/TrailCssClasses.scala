package views.support

import model.pressed.{PressedContent, CardStyle}

object TrailCssClasses {
  def toneClassFromStyle(cardStyle: CardStyle) =
    s"tone-${cardStyle.toneString}"

  def toneClass(content: model.Content): String = toneClassFromStyle(content.cardStyle)
  def toneClass(item: model.ContentType): String = toneClassFromStyle(item.content.cardStyle)
  def toneClass(faciaContent: PressedContent): String = toneClassFromStyle(faciaContent.card.cardStyle)
}
