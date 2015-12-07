package sudoku

import model.{StandalonePage, MetaData}
import play.api.libs.json.{JsString, JsValue}

class SudokuPage(val sudoku: Sudoku) extends StandalonePage {
  override val metadata = MetaData.make(
    id = sudoku.id,
    section = "sudokus",
    analyticsName = sudoku.id,
    webTitle = sudoku.title,
    javascriptConfigOverrides = Map(
    "section" -> JsString("lifeandstyle"),
    "series" -> JsString("Sudoku"))
  )
}
