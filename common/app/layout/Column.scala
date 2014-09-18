package layout

import slices._

case class ItemLayout(mobileClass: String, desktopClass: String)
case class SliceLayout(id: String, columns: Seq[Column])

sealed trait Column

case class SingleItem(width: Int, layout: ItemLayout) extends Column
case class Rows(width: Int, layout: ItemLayout) extends Column
case class SplitColumn(width: Int, layout1: ItemLayout, layout2: ItemLayout) extends Column
case object MPU extends Column
