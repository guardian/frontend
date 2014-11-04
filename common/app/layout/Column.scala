package layout

object ItemClasses {
  val showMore = ItemClasses(mobile = "list", tablet = "list")
}

case class ItemClasses(mobile: String, tablet: String, desktop: Option[String] = None) {
  /** Template helper */
  def classes: String = s"fc-item--$mobile-mobile fc-item--$tablet-tablet" +
    desktop.map(d => s" fc-item--$d-desktop").getOrElse("")

  /** Video.JS has issues if we render too many videos on a front (even if those videos are never displayed
    * or loaded).
    *
    * As such we only render the video player if there is a breakpoint on which it will be shown. This is
    * currently determined in quite a hacky way based on the item classes.
    */
  def showVideoPlayer =
    Seq("half", "three", "full", "mega-full").exists(size => classes.contains(size))
}
case class SliceLayout(cssClassName: String, columns: Seq[Column])

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
  def fromItems(items: Seq[Card], layout: SliceLayout): (SliceWithCards, Seq[Card]) = {
    val (columns, unconsumed) = layout.columns.foldLeft((Seq.empty[ColumnAndCards], items)) {
      case ((acc, itemsRemaining), column) =>
        val (itemsForColumn, itemsNotConsumed) = itemsRemaining splitAt itemsToConsume(column)

        (acc :+ ColumnAndCards(column, itemsForColumn), itemsNotConsumed)
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
