package crosswords

import com.gu.crosswords.api.client.models.{Position, Dimensions, Crossword}
import scalaz.State
import scalaz.syntax.traverse._
import scalaz.std.list._
import Function.const

case class Cell(number: Option[Int])

object Grid {
  type GridState[A] = State[Grid, A]

  def empty(columns: Int, rows: Int) = Grid(rows, columns, Map.empty)

  def setNumber(position: Position, number: Int) = State[Grid, Unit] { grid =>
    (grid.copy(cells = grid.cells + (position -> Cell(Some(number)))), Unit)
  }

  def setEditable(position: Position) = State.modify[Grid] { grid =>
    grid.cells.get(position).map(const(grid)) getOrElse {
      grid.copy(cells = grid.cells + (position -> Cell(None)))
    }
  }

  def fromCrossword(crossword: Crossword) = {
    val Dimensions(columns, rows) = crossword.dimensions

    crossword.entries.traverseS { entry =>
      (setNumber(entry.position, entry.number) +:
        entry.allPositions.map(setEditable)).sequence[GridState, Unit]
    }.run(Grid.empty(columns, rows))._1
  }
}

case class Grid(columns: Int, rows: Int, cells: Map[Position, Cell])

object CrosswordSvg {
  def drawCell(x: Double, y: Double, width: Double, height: Double, cell: Cell) = {
    val cell = <rect x={x.toString}
                     y={y.toString}
                     width={width.toString}
                     height={height.toString}
                     style="fill: #ffffff" />

    /** TODO add number */

    cell
  }

  def apply(crossword: Crossword, width: Int, height: Int) = {
    val Dimensions(columns, rows) = crossword.dimensions
    val cellWidth = width.toDouble / columns
    val cellHeight = height.toDouble / rows

    <svg xmlns="http://www.w3.org/2000/svg"
         xmlns:xlink="http://www.w3.org/1999/xlink"
         width={width.toString}
         height={height.toString}>
      <rect x="0" y="0" width={width.toString} height={height.toString} style="fill: #000000" />
      {
        for {
          (Position(x, y), cell) <- Grid.fromCrossword(crossword).cells.toSeq
        } yield drawCell(x * cellWidth, y * cellHeight, cellWidth, cellHeight, cell)
      }
    </svg>
  }
}
