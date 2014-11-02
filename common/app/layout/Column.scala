package layout

import cards.{ListItem, CardType}
import com.gu.facia.client.models.CollectionConfig
import slices.{MobileShowMore, RestrictTo}
import views.support.CutOut

object ItemClasses {
  val showMore = ItemClasses(mobile = ListItem, tablet = ListItem)
}

case class ItemClasses(mobile: CardType, tablet: CardType, desktop: Option[CardType] = None) {
  /** Template helper */
  def classes: String = s"fc-item--${mobile.cssClassName}-mobile fc-item--${tablet.cssClassName}-tablet" +
    desktop.map(d => s" fc-item--${d.cssClassName}-desktop").getOrElse("")

  def allTypes = Set(mobile, tablet) ++ desktop.toSet

  def showVideoPlayer = allTypes.exists(_.showVideoPlayer)

  def showCutOut = allTypes.exists(_.showCutOut)
}
case class SliceLayout(cssClassName: String, columns: Seq[Column])

object Column {
  def cardStyle(column: Column, index: Int) = column match {
    case SingleItem(_, itemClasses) => Some(itemClasses)
    case Rows(_, _, _, itemClasses) => Some(itemClasses)
    case SplitColumn(_, top, _) if index == 0 => Some(top)
    case SplitColumn(_, _, bottom) => Some(bottom)
    case _ => None
  }
}

sealed trait Column {
  def numItems: Int
  def colSpan: Int
}

case class SingleItem(colSpan: Int, itemClasses: ItemClasses) extends Column {
  val numItems: Int = 1
}
case class Rows(colSpan: Int, columns: Int, rows: Int, itemClasses: ItemClasses) extends Column {
  val numItems: Int = columns * rows
}
case class SplitColumn(colSpan: Int, topItemClasses: ItemClasses, bottomItemsClasses: ItemClasses) extends Column {
  val numItems: Int = 3
}
case class MPU(colSpan: Int) extends Column {
  val numItems: Int = 0
}

object SliceWithCards {
  def itemsToConsume(column: Column) = column match {
    case _: SingleItem => 1
    case Rows(_, columns, rows, _) => columns * rows
    case _: SplitColumn => 3
    case _: MPU => 0
  }

  /** The slice with cards assigned to columns, and the remaining cards that were not consumed */
  def fromItems(
    items: Seq[IndexedTrail],
    layout: SliceLayout,
    config: CollectionConfig,
    mobileShowMore: MobileShowMore
  ): (SliceWithCards, Seq[IndexedTrail]) = {
    val (columns, unconsumed) = layout.columns.foldLeft((Seq.empty[ColumnAndCards], items)) {
      case ((acc, itemsRemaining), column) =>
        val (itemsForColumn, itemsNotConsumed) = itemsRemaining splitAt itemsToConsume(column)

        val cards = itemsForColumn map { case IndexedTrail(trail, index) =>
          Card(
            index,
            FaciaCard.fromTrail(
              trail,
              config,
              Column.cardStyle(column, index).getOrElse(ItemClasses.showMore)
            ),
            mobileShowMore match {
              case RestrictTo(nToShowOnMobile) if index >= nToShowOnMobile => Some(Mobile)
              case _ => None
            },
            CutOut.fromTrail(trail)
          )
        }

        (acc :+ ColumnAndCards(column, cards), itemsNotConsumed)
    }

    (SliceWithCards(layout.cssClassName, columns), unconsumed)
  }
}

case class SliceWithCards(cssClassName: String, columns: Seq[ColumnAndCards]) {
  def numberOfItems = (columns map { columnAndCards: ColumnAndCards =>
    columnAndCards.column match {
      case Rows(_, cols, _, _) => cols
      case _ => 1
    }
  }).sum

  def numberOfCols = (columns map { columnAndCards: ColumnAndCards =>
    columnAndCards.column.colSpan
  }).sum
}


case class ColumnAndCards(column: Column, cards: Seq[Card])
