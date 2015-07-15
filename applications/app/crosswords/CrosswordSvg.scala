package crosswords

import com.gu.contentapi.client.model.{CrosswordPosition, CrosswordDimensions, Crossword, CrosswordEntry}
import scalaz.State
import scalaz.syntax.traverse._
import scalaz.std.list._
import Function.const

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

object CrosswordSvg {
  val BorderSize = 1
  val CellSize = 31

  implicit val positionOrdering = Ordering.by[CrosswordPosition, (Int, Int)](position => (position.y, position.x))

  def drawCell(x: Double, y: Double, cell: Cell) = {
    val cellRect = <rect x={x.toString}
                     y={y.toString}
                     width={CellSize.toString}
                     height={CellSize.toString}
                     style="fill: #ffffff" />

    cell.number map { n =>
      <g>
        {cellRect}
        <text x={(x + 1).toString} y={(y + 9).toString} class="crossword__cell-number">{n}</text>
      </g>
    } getOrElse cellRect
  }

  def apply(crossword: Crossword, boxWidth: Option[String], boxHeight: Option[String], trim: Boolean) = {
    val CrosswordDimensions(columns, rows) = crossword.dimensions

    val width = columns * (BorderSize + CellSize) + BorderSize
    val height = rows * (BorderSize + CellSize) + BorderSize

    val viewBoxHeight = if (trim) width * 0.6 else height

    <svg viewBox={s"0, 0, $width, $viewBoxHeight"} class="crossword__grid" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="0" width={width.toString} height={height.toString} style="fill: #000000" />
      {
        for {
          (CrosswordPosition(x, y), cell) <- Grid.fromCrossword(crossword).cells.toSeq.sortBy(_._1)
        } yield drawCell(
          x * (CellSize + BorderSize) + BorderSize,
          y * (CellSize + BorderSize) + BorderSize,
          cell
        )
      }
    </svg>
  }
}
