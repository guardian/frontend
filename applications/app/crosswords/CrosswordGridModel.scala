package crosswords

import com.gu.contentapi.client.model.{CrosswordEntry, CrosswordDimensions, Crossword, CrosswordPosition}

import scalaz.State
import scalaz.syntax.traverse._
import scalaz.std.list._
import Function.const


trait CrosswordGridDataOrdering {
  implicit val positionOrdering = Ordering.by[CrosswordPosition, (Int, Int)](position => (position.y, position.x))
}

trait CrosswordGridColumnNotation {
  val columnsByLetters = (('A' to 'Z').toList.zip(Stream from 0) map { case(letter, number) => (number, letter)}).toMap
}

case class Cell(number: Option[Int])

object Grid {
  type GridState[A] = State[Grid, A]

  def empty(columns: Int, rows: Int) = Grid(rows, columns, Map.empty)

  def setNumber(position: CrosswordPosition, number: Int): State[Grid, Unit] = State[Grid, Unit] { grid =>
    (grid.copy(cells = grid.cells + (position -> Cell(Some(number)))), Unit)
  }

  def setEditable(position: CrosswordPosition) = State.modify[Grid] { grid =>
    grid.cells.get(position).map(const(grid)) getOrElse {
      grid.copy(cells = grid.cells + (position -> Cell(None)))
    }
  }

  def fromCrossword(crossword: Crossword) = {
    val CrosswordDimensions(columns, rows) = crossword.dimensions

    crossword.entries.toList.traverseS { crosswordEntry: CrosswordEntry => {
      val entry = Entry.fromCrosswordEntry(crosswordEntry)
      val settings = setNumber(entry.position, entry.number) +: crosswordEntry.allPositions.map(setEditable).toList
      settings.sequence[GridState, Unit]
    }
    }.run(Grid.empty(columns, rows))._1
  }
}

case class Grid(columns: Int, rows: Int, cells: Map[CrosswordPosition, Cell])

