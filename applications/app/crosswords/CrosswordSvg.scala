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
  val BorderSize = 1
  val CellSize = 30

  implicit val positionOrdering = Ordering.by[Position, (Int, Int)](position => (position.y, position.x))

  def drawCell(x: Double, y: Double, cell: Cell) = {
    val cellRect = <rect x={x.toString}
                     y={y.toString}
                     width={CellSize.toString}
                     height={CellSize.toString}
                     style="fill: #ffffff" />

    cell.number map { n =>
      <g>
        {cellRect}
        <text x={(x + 1).toString} y={(y + 8).toString} class="crossword__cell-number">{n}</text>
      </g>
    } getOrElse cellRect
  }

  def apply(crossword: Crossword, boxWidth: Option[String], boxHeight: Option[String]) = {
    val Dimensions(columns, rows) = crossword.dimensions

    val width = columns * (BorderSize + CellSize) + BorderSize
    val height = rows * (BorderSize + CellSize) + BorderSize

    <svg xmlns="http://www.w3.org/2000/svg"
         xmlns:xlink="http://www.w3.org/1999/xlink"
         viewBox={s"0, 0, $width, $height"}
         preserveAspectRatio="none"
         width={boxWidth.getOrElse(width + "px")}
         height={boxHeight.getOrElse(height + "px")}
         style="font-size: 10px">
      <rect x="0" y="0" width={width.toString} height={height.toString} style="fill: #000000" />
      {
        for {
          (Position(x, y), cell) <- Grid.fromCrossword(crossword).cells.toSeq.sortBy(_._1)
        } yield drawCell(
          x * (CellSize + BorderSize) + BorderSize,
          y * (CellSize + BorderSize) + BorderSize,
          cell
        )
      }
    </svg>
  }
}
