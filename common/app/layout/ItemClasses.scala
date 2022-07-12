package layout

import cards.{CardType, ListItem, MediaList, Standard}

case class ItemClasses(mobile: CardType, tablet: CardType, desktop: Option[CardType] = None) {

  /** Template helper */
  def classes: String =
    s"fc-item--${mobile.cssClassName}-mobile fc-item--${tablet.cssClassName}-tablet" +
      desktop.map(d => s" fc-item--${d.cssClassName}-desktop").getOrElse("")

  def allTypes: Set[CardType] = Set(mobile, tablet) ++ desktop.toSet

  def showVideoPlayer: Boolean = allTypes.exists(_.videoPlayer.show)
  def showVideoEndSlate: Boolean = allTypes.exists(_.videoPlayer.showEndSlate)
  def showYouTubeMediaAtomPlayer: Boolean = allTypes.exists(_.youTubeMediaAtomPlayer.show)
  def showCutOut: Boolean = allTypes.exists(_.showCutOut)
  def canShowSlideshow: Boolean = allTypes.exists(_.canShowSlideshow)
  def canBeDynamicLayout: Boolean = allTypes.exists(_.canBeDynamicLayout)
}

object ItemClasses {
  val showMore = ItemClasses(mobile = ListItem, tablet = ListItem)

  val liveBlogMore = ItemClasses(mobile = MediaList, tablet = Standard)
}
