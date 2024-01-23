package crosswords

import com.gu.contentapi.client.model.v1.{Crossword, CrosswordDimensions}
import model.CrosswordPosition

import scala.xml.Elem

object CrosswordSvg extends CrosswordGridDataOrdering {
  val BorderSize = 1
  val CellSize = 31

  def drawCell(x: Double, y: Double, cell: Cell): Elem = {
    val cellRect = <rect x={x.intValue.toString}
                     y={y.intValue.toString}
                     width={CellSize.intValue.toString}
                     height={CellSize.intValue.toString} />

    cell.number map { n =>
      <g>
        {cellRect}
        <text x={(x + 1).toString} y={(y + 9).toString}>{n}</text>
      </g>
    } getOrElse cellRect
  }

  val style =
    """
.cells rect { fill: #fff }

text {
  font-family: 'Guardian Text Sans Web','Helvetica Neue',Helvetica,Arial,'Lucida Grande',sans-serif;
  font-size: 10px;
}

@font-face {
  font-family: 'Guardian Text Sans Web';
  src: url('data:application/font-woff;charset=utf-8;base64,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') format('woff');
  font-weight: normal;
  font-style: normal;
  font-display: swap;
}"""

  def cellSizing(x: Double): Double = {
    x * (CellSize + BorderSize) + BorderSize
  }

  def apply(crossword: Crossword, boxWidth: Option[String], boxHeight: Option[String], trim: Boolean): Elem = {
    val CrosswordDimensions(columns, rows) = crossword.dimensions

    val width = cellSizing(columns)
    val height = cellSizing(rows)

    val viewBoxHeight = if (trim) (width * 0.6).ceil.intValue.toString else height

    <svg viewBox={s"0 0, $width $viewBoxHeight"} xmlns="http://www.w3.org/2000/svg" class="crossword__grid" >
      <style>{style}</style>
      <rect x="0" y="0" width={width.intValue.toString} height={height.intValue.toString} class="crossword__grid-background" />
      <g class="cells">
      {
      for {
        (CrosswordPosition(x, y), cell) <- Grid.fromCrossword(crossword).cells.toSeq.sortBy(_._1)
      } yield drawCell(
        cellSizing(x),
        cellSizing(y),
        cell,
      )
    }</g>
    </svg>
  }
}
