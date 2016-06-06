package sudoku

import model.{MetaData, SectionSummary, StandalonePage}
import play.api.libs.json.JsString

class SudokuPage(val sudoku: Sudoku) extends StandalonePage {
  override val metadata = MetaData.make(
    id = sudoku.id,
    sectionSummary = Some(SectionSummary.fromId("sudokus")),
    analyticsName = sudoku.id,
    webTitle = sudoku.title,
    javascriptConfigOverrides = Map(
    "section" -> JsString("lifeandstyle"),
    "series" -> JsString("Sudoku"))
  )
}
