package layout

case class ItemLayout(mobileClass: String, desktopClass: String) {
  /** Template helper */
  def classes = s"$mobileClass $desktopClass"
}
case class SliceLayout(id: String, columns: Seq[Column])

sealed trait Column

case class SingleItem(width: Int, layout: ItemLayout) extends Column
case class Rows(width: Int, columns: Int, rows: Int, layout: ItemLayout) extends Column
case class SplitColumn(width: Int, topItemLayout: ItemLayout, bottomItemsLayout: ItemLayout) extends Column
case class MPU(width: Int) extends Column

object SliceWithCards {
  def itemsToConsume(column: Column) = column match {
    case _: SingleItem => 1
    case Rows(_, columns, rows, _) => columns * rows
    case _: SplitColumn => 3
    case _: MPU => 0
  }

  /** The slice with cards assigned to columns, and the remaining cards that were not consumed */
  def fromItems(items: Seq[Card], layout: SliceLayout): (SliceWithCards, Seq[Card]) = {
    val (columns, unconsumed) = layout.columns.foldLeft((Seq.empty[ColumnAndCards], items)) { case ((acc, itemsRemaining), column) =>
      val (itemsForColumn, itemsNotConsumed) = itemsRemaining splitAt itemsToConsume(column)

      (acc :+ ColumnAndCards(column, itemsForColumn), itemsNotConsumed)
    }

    (SliceWithCards(layout.id, columns), unconsumed)
  }
}

case class SliceWithCards(id: String, columns: Seq[ColumnAndCards])
case class ColumnAndCards(column: Column, cards: Seq[Card])
