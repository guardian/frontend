package crosswords

import com.gu.contentapi.client.model.{CrosswordPosition => Position, Crossword}

import scalaz.std.list._
import scalaz.std.set._
import scalaz.syntax.foldable._

object CrosswordGrid {
  val DefaultTreat = CrosswordGrid(Set(
    (2, 0),
    (3, 0),
    (4, 0),
    (5, 0),
    (6, 0),
    (0, 1),
    (2, 1),
    (4, 1),
    (6, 1),
    (0, 2),
    (1, 2),
    (2, 2),
    (3, 2),
    (4, 2),
    (6, 2),
    (0, 3),
    (2, 3),
    (4, 3),
    (6, 3),
    (0, 4),
    (1, 4),
    (2, 4),
    (3, 4),
    (4, 4),
    (5, 4),
    (6, 4),
    (0, 5),
    (4, 5),
    (6, 5),
    (0, 6),
    (1, 6),
    (2, 6),
    (3, 6),
    (4, 6),
    (5, 6),
    (6, 6)
  ).map((Position.apply _).tupled))

  def fromCrossword(crossword: Crossword): CrosswordGrid =
    CrosswordGrid(crossword.entries.toList.foldMap[Set[Position]](_.allPositions.toSet))
}

case class CrosswordGrid(cellsInPlay: Set[Position])

object CrosswordPreview {
  val Rows = 7
  val Columns = 7
  val BorderSize = 1
  val CellSize = 14

  private def position(n: Int) = BorderSize + n * (CellSize + BorderSize)

  val Width = position(Columns)
  val Height = position(Rows)

  def fromCrosswordGrid(crosswordGrid: CrosswordGrid) =
    <svg xmlns="http://www.w3.org/2000/svg"
         xmlns:xlink="http://www.w3.org/1999/xlink"
         viewBox={s"0, 0, $Width, $Height"}
         width={s"${Width}px"}
         height={s"${Height}px"}
         class="treats__crossword">
      <rect x="0" y="0" fill="#000000" width={Width.toString} height={Height.toString} />
      {crosswordGrid.cellsInPlay map { case Position(x, y) =>
        <rect x={position(x).toString} y={position(y).toString} width={CellSize.toString} height={CellSize.toString} fill="#ffffff" />
      }}
    </svg>
}
