package sudoku

import model.MetaData
import play.api.libs.json.{JsString, JsValue}

class SudokuPage(val sudoku: Sudoku) extends MetaData {
  override def id: String = sudoku.id

  override def section: String = "sudokus"

  override def analyticsName: String = id

  override def webTitle: String = sudoku.title

  override def metaData: Map[String, JsValue] = super.metaData ++ Map(
    "section" -> JsString("lifeandstyle"),
    "series" -> JsString("Sudoku")
  )
}
