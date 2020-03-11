package layout

import cards.{CardType, ListItem, MediaList, Standard}
import model.pressed.CollectionConfig
import play.twirl.api.Html
import slices.{MobileShowMore, RestrictTo}
import scala.annotation.tailrec

case class SliceLayout(cssClassName: String, columns: Seq[Column]) {
  def numItems: Int = columns.map(_.numItems).sum
}
