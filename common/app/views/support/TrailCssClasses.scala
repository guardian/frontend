package views.support

import model.pressed.{PressedContent, CardStyle}

object TrailCssClasses {
  def toneClassFromStyle(cardStyle: CardStyle) =
    s"tone-${cardStyle.toneString}"

  def toneClass(content: model.Content) = toneClassFromStyle(content.cardStyle)
  def toneClass(item: model.ContentType) = toneClassFromStyle(item.content.cardStyle)
  def toneClass(faciaContent: PressedContent) = toneClassFromStyle(faciaContent.properties.cardStyle)
}
