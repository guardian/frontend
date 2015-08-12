package crosswords

import com.gu.contentapi.client.model.{Content => ApiContent}
import model.{GuardianContentTypes, ApiContentWithMeta, Content}
import play.api.libs.json.{JsValue, JsString}

case class SvgDimensions(width: Int, height: Int) {
  def styleString = s"width: $width; height: $height"
}

class CrosswordPage(val crossword: CrosswordData, content: ApiContentWithMeta) extends Content(content) {

  override lazy val id: String = crossword.id

  override lazy val section: String = "crosswords"

  override lazy val analyticsName: String = id

  override lazy val webTitle: String = crossword.name

  override lazy val contentType = GuardianContentTypes.Crossword

  override lazy val metaData: Map[String, JsValue] =
    super.metaData ++ Map("contentType" -> JsString(contentType))

  import CrosswordSvg.{BorderSize, CellSize}

  def fallbackDimensions = SvgDimensions(
    crossword.dimensions.cols * (CellSize + BorderSize) + BorderSize,
    crossword.dimensions.rows * (CellSize + BorderSize) + BorderSize
  )
}
