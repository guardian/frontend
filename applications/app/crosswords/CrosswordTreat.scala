package crosswords

case class Position(x: Int, y: Int)

case class CrosswordGrid(cellsInPlay: Set[Position])

object CrosswordTreat {
  val Rows = 7
  val Columns = 7
  val BorderSize = 1
  val CellSize = 14

  private def position(n: Int) = BorderSize + n * (CellSize + BorderSize)

  val Width = position(Columns) + BorderSize
  val Height = position(Rows) + BorderSize

  def fromCrosswordGrid(crosswordGrid: CrosswordGrid) =
    <svg xmlns="http://www.w3.org/2000/svg"
         xmlns:xlink="http://www.w3.org/1999/xlink"
         viewBox={s"0, 0, $Width, $Height"}
         width={s"${Width}px"}
         height={s"${Height}px"}>
      <rect x="0" y="0" fill="#000000" width={Width} height={Height} />
      {crosswordGrid.cellsInPlay map { case Position(x, y) =>
        <rect x={position(x)} y={position(y)} width={CellSize} height={CellSize} fill="#ffffff" />
      }}
    </svg>
}
