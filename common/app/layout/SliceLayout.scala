package layout

case class SliceLayout(cssClassName: String, columns: Seq[Column]) {
  def numItems: Int = columns.map(_.numItems).sum
}
