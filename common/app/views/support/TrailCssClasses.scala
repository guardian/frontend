package views.support

import model.Trail

object TrailCssClasses {
  def toneClassFromStyle(cardStyle: CardStyle) =
    s"tone-${cardStyle.toneString}"

  def toneClass(trail: Trail) = toneClassFromStyle(CardStyle(trail))

  /** Article will soon support all tone classes so we'll be able to remove this silliness */
  val SupportedArticleTones: Set[CardStyle] = Set(
    Analysis,
    Comment,
    Letters,
    Editorial,
    DeadBlog,
    Feature,
    LiveBlog,
    Media,
    Podcast,
    Review
  )

  def articleToneClass(trail: Trail) = {
    if (SupportedArticleTones.contains(CardStyle(trail))) {
      toneClass(trail)
    } else {
      "tone-news"
    }
  }
}
