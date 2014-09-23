package layout

case class ItemClasses(mobile: String, desktop: String) {
  /** Template helper */
  def classes = s"fc-item--$mobile-mobile fc-item--$desktop-tablet"
}
case class SliceLayout(cssClassName: String, columns: Seq[Column])

sealed trait Column {
  def numItems: Int
}

case class SingleItem(colSpan: Int, itemClasses: ItemClasses) extends Column {
  val numItems: Int = 1
}
case class Rows(colSpan: Int, columns: Int, rows: Int, itemClasses: ItemClasses) extends Column {
  val numItems: Int = columns * rows
}
case class SplitColumn(colSpan: Int, topItemClasses: ItemClasses, bottomItemClasses: ItemClasses) extends Column {
  val numItems: Int = 2
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
  def numberOfColumns = (columns map { columnAndCards: ColumnAndCards =>
    columnAndCards.column match {
      case Rows(_, cols, _, _) => cols
      case _ => 1
    }
  }).sum
}


case class ColumnAndCards(column: Column, cards: Seq[Card])
