package crosswords

import com.gu.contentapi.client.model.v1.{CrosswordPosition, CrosswordDimensions, Crossword}

object CrosswordSvg extends CrosswordGridDataOrdering {
  val BorderSize = 1
  val CellSize = 31

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
      <rect x="0" y="0" width={width.toString} height={height.toString} class="crossword__grid-background" />
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
