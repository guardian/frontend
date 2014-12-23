package sudoku

import model.MetaData

class SudokuPage(val sudoku: Sudoku) extends MetaData {
  override def id: String = sudoku.id

  override def section: String = "sudokus"

  override def analyticsName: String = id

  override def webTitle: String = sudoku.title
}
