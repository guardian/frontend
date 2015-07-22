package crosswords

import model.MetaData

case class SvgDimensions(width: Int, height: Int) {
  def styleString = s"width: $width; height: $height"
}

class CrosswordPage(val crossword: CrosswordData) extends MetaData {
  override def id: String = s"crosswords/${crossword.crosswordType}/${crossword.number}"

  override def section: String = "crosswords"

  override def analyticsName: String = id

  override def webTitle: String = crossword.name

  import CrosswordSvg.{BorderSize, CellSize}

  def fallbackDimensions = SvgDimensions(
    crossword.dimensions.cols * (CellSize + BorderSize) + BorderSize,
    crossword.dimensions.rows * (CellSize + BorderSize) + BorderSize
  )
}
