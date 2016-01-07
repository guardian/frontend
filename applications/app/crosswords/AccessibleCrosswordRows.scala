package crosswords

import com.gu.contentapi.client.model.v1.{CrosswordDimensions, Crossword}
import model.CrosswordPosition

case class AccessibleCrosswordRow(rowNumber: Int, blankColumns: List[Char])

case class AccessibleCrosswordRows(rows: List[AccessibleCrosswordRow])

object AccessibleCrosswordRows extends CrosswordGridDataOrdering with CrosswordGridColumnNotation {

  def getBlankSquaresForRow(positionsForRow: List[CrosswordPosition], rowIndex: Int, columns: Int) : AccessibleCrosswordRow = {
    val missingColumns = (for {
      colToCheck <- 0 until columns
      if !positionsForRow.contains(CrosswordPosition(colToCheck, rowIndex))
    } yield columnsByLetters(colToCheck) ).toList
    AccessibleCrosswordRow(rowIndex + 1, missingColumns)
  }

  def apply(crossword: Crossword) : AccessibleCrosswordRows = {
    val CrosswordDimensions(columns, rows) = crossword.dimensions
    val allCrosswordPositionsByRow = Grid.fromCrossword(crossword).cells.toList.map { cell => cell._1 }.groupBy{ position => position.y }

    val missingColumnsByRow = (0 until rows).toList.map {
      row =>
        allCrosswordPositionsByRow.get(row) match {
          case Some(crosswordPositionsForRow) => getBlankSquaresForRow(crosswordPositionsForRow, row, columns)
          case _ => AccessibleCrosswordRow(row + 1, List.empty)
        }
    }
    AccessibleCrosswordRows(missingColumnsByRow)
  }
}
