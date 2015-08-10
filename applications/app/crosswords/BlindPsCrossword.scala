package crosswords

import com.gu.contentapi.client.model.{CrosswordPosition, CrosswordDimensions, Crossword}

case class BlindCrosswordRow(rowIndex: Int, blankColumns: List[Char])

object BlindPsCrossword extends CrosswordGridDataOrdering {

  def getBlankSquaresForRow(positionsForRow: List[CrosswordPosition], rowIndex: Int, columns: Int) : BlindCrosswordRow = {
    val missingColumns = (for {
      colToCheck <- 1 to columns
      if !positionsForRow.contains(CrosswordPosition(rowIndex, colToCheck))
    } yield columnsByLetters(colToCheck) ).toList
    BlindCrosswordRow(rowIndex, missingColumns)
  }

  def apply(crossword: Crossword) = {
    val CrosswordDimensions(columns, rows) = crossword.dimensions
    val allCrosswordPositionsByRow = Grid.fromCrossword(crossword).cells.toList.map {  cell => cell._1  }.groupBy( position => position.x)

    val missingColumnsByRow = (1 to rows).toList.map {
      row =>
        allCrosswordPositionsByRow.get(row) match {
          case Some(crosswordPositionsForRow) => getBlankSquaresForRow(crosswordPositionsForRow, row, columns)
          case _ => BlindCrosswordRow(row, List.empty)
        }
    }
    missingColumnsByRow
  }
}
