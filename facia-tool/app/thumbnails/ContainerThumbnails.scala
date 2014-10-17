package thumbnails

import layout._
import slices.{Slice, FixedContainers}

object ContainerThumbnails {
  val SliceHeight = 25
  val Width = 100

  val Style = "fill:#ccc;stroke:white;stroke-width:1"

  def totalSpan(columns: Seq[Column]) = columns.map(_.colSpan).sum

  def drawSlice(slice: Slice, index: Int) = {
    val columns = slice.layout.columns

    val totalColSpan = totalSpan(columns)
    val unitSpanWidth = Width.toDouble / totalColSpan

    val columnLeftSides = columns.inits.toSeq.reverse map { columnsSoFar =>
      totalSpan(columnsSoFar) * unitSpanWidth
    }

    ((columns zip columnLeftSides) map { case (column, x) =>
      drawColumn(column, x, index * SliceHeight, column.colSpan * unitSpanWidth, SliceHeight)
    }).flatten
  }

  def drawColumn(column: Column, x: Double, y: Double, width: Double, height: Double) = {
    def box = <rect x={x.toString} y={y.toString} width={width.toString} height={height.toString} style={Style} />

    column match {
      case _: SingleItem => box

      case Rows(_, columns, rows, _) =>
        val rowWidth = width / columns.toDouble
        val rowHeight = height / rows.toDouble

        for {
          col <- 0 until columns
          row <- 0 until rows
        } yield <rect x={(x + col * rowWidth).toString}
                      y={(y + row * rowHeight).toString}
                      width={rowWidth.toString}
                      height={rowHeight.toString}
                      style={Style} />

      case _: MPU =>
        val centreX = x + width / 2
        val centreY = y + height / 2

        <g>
          {box}
          <text x={centreX.toString}
                y={centreY.toString}
                text-anchor="middle"
                style="font: 10px Arial, Verdana; alignment-baseline: central; fill: white;">MPU</text>
        </g>

      case _: SplitColumn =>
        val centreY = y + height / 2

        <g>
          <rect x={x.toString} y={y.toString} width={width.toString} height={(height / 2).toString} style={Style} />
          <rect x={x.toString} y={centreY.toString} width={width.toString} height={(height / 4).toString} style={Style} />
          <rect x={x.toString} y={(centreY + height / 4).toString} width={width.toString} height={(height / 4).toString} style={Style} />
        </g>

    }
  }

  def fromId(id: String) = {
    FixedContainers.unapply(Some(id)) map { container =>
      <svg xmlns="http://www.w3.org/2000/svg"
           xmlns:xlink="http://www.w3.org/1999/xlink"
           width={(Width + 2).toString}
           height={((container.slices.length * SliceHeight) + 2).toString}>
        {container.slices.zipWithIndex.map((drawSlice _).tupled)}
      </svg>
    }
  }
}
