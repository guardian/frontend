package views.support

import model.pressed.{CardStyle, DeadBlog, PressedContent}

object TrailCssClasses {
  def toneClassFromStyle(cardStyle: CardStyle): String =
    s"tone-${cardStyle.toneString}"

  def toneClass(content: model.Content): String = toneClassFromStyle(content.cardStyle)
  def toneClass(item: model.ContentType): String = toneClassFromStyle(item.content.cardStyle)
  def toneClass(faciaContent: PressedContent): String = toneClassFromStyle(faciaContent.card.cardStyle)

  def toneClassForLiveblog(item: model.ContentType): String = {
    // Special report styling was overriding deadblog styling. This makes it explicit
    val overridden =
      if (item.content.tags.isLiveBlog && !item.content.fields.isLive) DeadBlog
      else item.content.cardStyle

    toneClassFromStyle(overridden)
  }
}
