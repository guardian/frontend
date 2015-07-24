package crosswords

import com.gu.contentapi.client.model.{Content => ApiContent}
import model.{ApiContentWithMeta, Content}

case class SvgDimensions(width: Int, height: Int) {
  def styleString = s"width: $width; height: $height"
}

class CrosswordPage(val crossword: CrosswordData, content: ApiContentWithMeta) extends Content(content) {

  override lazy val id: String = crossword.id

  override lazy val section: String = "crosswords"

  override lazy val analyticsName: String = id

  override lazy val webTitle: String = crossword.name

  import CrosswordSvg.{BorderSize, CellSize}

  def fallbackDimensions = SvgDimensions(
    crossword.dimensions.cols * (CellSize + BorderSize) + BorderSize,
    crossword.dimensions.rows * (CellSize + BorderSize) + BorderSize
  )
}
