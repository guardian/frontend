package sudoku

import model.{Page, MetaData}
import play.api.libs.json.{JsString, JsValue}

class SudokuPage(val sudoku: Sudoku) extends Page {
  override val metadata = MetaData.make(
    id = sudoku.id,
    section = "sudokus",
    analyticsName = sudoku.id,
    webTitle = sudoku.title)

  val javascriptConfig: Map[String, JsValue] = metadata.javascriptConfig ++ Map(
    "section" -> JsString("lifeandstyle"),
    "series" -> JsString("Sudoku")
  )
}
