package crosswords

import com.gu.contentapi.client.model.v1.{
  CrosswordEntry,
  CrosswordDimensions,
  Crossword,
  CrosswordPosition => ApiCrosswordPosition,
}
import model.{Entry, CrosswordPosition}
import Function.const

trait CrosswordGridDataOrdering {
  implicit val positionOrdering = Ordering.by[CrosswordPosition, (Int, Int)](position => (position.y, position.x))
}

trait CrosswordGridColumnNotation {
  val columnsByLetters =
    (('A' to 'Z').toList.zip(Stream from 0) map { case (letter, number) => (number, letter) }).toMap
}

case class Cell(number: Option[Int])

object Grid {
  def fromCrossword(crossword: Crossword): Grid = {
    val CrosswordDimensions(columns, rows) = crossword.dimensions
    crossword.entries.foldLeft(Grid(rows, columns, Map.empty)) { (grid: Grid, crosswordEntry: CrosswordEntry) =>
      grid.withCrosswordEntry(crosswordEntry)
    }
  }
}

case class Grid(columns: Int, rows: Int, cells: Map[CrosswordPosition, Cell]) {

  def withCrosswordEntry(crosswordEntry: CrosswordEntry): Grid = {
    val entry = Entry.fromCrosswordEntry(crosswordEntry)
    crosswordEntry.allPositions().foldLeft(this.withEntry(entry)) { (grid, crosswordPosition) =>
      grid.withEditablePosition(crosswordPosition)
    }
  }

  private def withEntry(entry: Entry): Grid = {
    this.copy(cells = this.cells + (entry.position -> Cell(Some(entry.number))))
  }

  private def withEditablePosition(apiPosition: ApiCrosswordPosition): Grid = {
    val position = CrosswordPosition(apiPosition.x, apiPosition.y)
    this.cells.get(position).map(const(this)) getOrElse {
      this.copy(cells = this.cells + (position -> Cell(None)))
    }
  }
}
