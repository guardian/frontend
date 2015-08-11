package crosswords

import com.gu.contentapi.client.model.{CrosswordPosition, CrosswordDimensions, Crossword}

case class BlindPsCrosswordRow(rowNumber: Int, blankColumns: List[Char])

case class BlindPsCrosswordRows(rows: List[BlindPsCrosswordRow])

object BlindPsCrosswordRows extends CrosswordGridDataOrdering with CrosswordGridColumnNotation {

  def getBlankSquaresForRow(positionsForRow: List[CrosswordPosition], rowIndex: Int, columns: Int) : BlindPsCrosswordRow = {
    val missingColumns = (for {
      colToCheck <- 0 until columns
      if !positionsForRow.contains(CrosswordPosition(colToCheck, rowIndex))
    } yield columnsByLetters(colToCheck) ).toList
    BlindPsCrosswordRow(rowIndex + 1, missingColumns)
  }

  def apply(crossword: Crossword) : BlindPsCrosswordRows = {
    val CrosswordDimensions(columns, rows) = crossword.dimensions
    val allCrosswordPositionsByRow = Grid.fromCrossword(crossword).cells.toList.map { cell => cell._1 }.groupBy{ position => position.y }

    val missingColumnsByRow = (0 until rows).toList.map {
      row =>
        allCrosswordPositionsByRow.get(row) match {
          case Some(crosswordPositionsForRow) => getBlankSquaresForRow(crosswordPositionsForRow, row, columns)
          case _ => BlindPsCrosswordRow(row + 1, List.empty)
        }
    }
    BlindPsCrosswordRows(missingColumnsByRow)
  }
}
