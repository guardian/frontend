package crosswords

import com.gu.contentapi.client.model.{CrosswordPosition, CrosswordDimensions, Crossword}

case class BlindCrosswordRow(rowNumber: Int, blankColumns: List[Char])

object BlindPsCrossword extends CrosswordGridDataOrdering {

  def getBlankSquaresForRow(positionsForRow: List[CrosswordPosition], rowIndex: Int, columns: Int) : BlindCrosswordRow = {
    val missingColumns = (for {
      colToCheck <- 0 until columns
      if !positionsForRow.contains(CrosswordPosition(colToCheck, rowIndex))
    } yield columnsByLetters(colToCheck) ).toList
    BlindCrosswordRow(rowIndex + 1, missingColumns)
  }

  def apply(crossword: Crossword) = {
    val CrosswordDimensions(columns, rows) = crossword.dimensions
    val allCrosswordPositionsByRow = Grid.fromCrossword(crossword).cells.toList.map { cell => cell._1 }.groupBy{ position => position.y }

    val missingColumnsByRow = (0 until rows).toList.map {
      row =>
        allCrosswordPositionsByRow.get(row) match {
          case Some(crosswordPositionsForRow) => getBlankSquaresForRow(crosswordPositionsForRow, row, columns)
          case _ => BlindCrosswordRow(row + 1, List.empty)
        }
    }
    missingColumnsByRow
  }
}
