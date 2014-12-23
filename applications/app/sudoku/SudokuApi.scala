package sudoku

import play.api.libs.json.Json

object SudokuApi {
  def getData(id: String) = {
    /** Here's one I prepared earlier ...
      *
      * TODO: connect up with our actual Sudoku source of data.
      */
    Json.parse(
      """
        |[
        |    [null, 2, null, 5, null, null, null, 4, null],
        |    [8, null, null, null, null, null, null, null, null],
        |    [null, null, 4, null, 7, null, null, null, null],
        |    [null, null, 3, null, 8, null, null, 2, null],
        |    [null, null, null, null, 6, null, 9, 5, null],
        |    [7, null, null, 4, 3, 5, 6, null, null],
        |    [null, null, null, 3, null, null, 1, 6, 9],
        |    [null, 3, null, null, 9, null, null, 8, null],
        |    [null, 1, null, 2, null, null, null, 7, 5]
        |]
      """.stripMargin)
  }
}
