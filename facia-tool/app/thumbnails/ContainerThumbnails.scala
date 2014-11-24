package thumbnails

import layout._
import slices._

case class Rectangle(x: Double, y: Double, width: Double, height: Double)

object ContainerThumbnails {
  val SliceHeight = 40
  // if rows are not stretched to accommodate another column
  val BaseRowHeight = 7
  val Width = 100

  val Style = "fill: #CCCCCC; stroke: rgba(255,255,255,.75); stroke-width: 1"

  def totalSpan(columns: Seq[Column]) = columns.map(_.colSpan).sum

  def sliceHeight(slice: Slice) = {
    slice.layout.columns match {
      case Rows(_, _, rows, _) +: Nil => (rows * (BaseRowHeight + 1)) + 1
      case _ => SliceHeight
    }
  }

  def summing[A](as: Seq[A])(f: A => Double) = as.inits.toSeq.reverse map { xs =>
    xs.map(f).sum
  }

  def drawSlice(slice: Slice, yPos: Double) = {
    val columns = slice.layout.columns

    val totalColSpan = totalSpan(columns)
    val unitSpanWidth = Width.toDouble / totalColSpan

    val columnLeftSides = summing(columns)(_.colSpan * unitSpanWidth)

    ((columns zip columnLeftSides) map { case (column, x) =>
      drawColumn(column, x, yPos, column.colSpan * unitSpanWidth, sliceHeight(slice))
    }).flatten
  }

  def drawImage(x: Double, y: Double, width: Double, height: Double, itemClasses: ItemClasses) = {
    lazy val third = (width - 2) / 3

    ((itemClasses.tablet match {
      case cards.MediaList =>
        Some(Rectangle(x + 1, y + 1, width * .3, height))
      case cards.ThreeQuarters | cards.FullMedia75 =>
        Some(Rectangle(x + 1 + third, y + 1, third * 2, height - 2))
      case cards.ThreeQuartersRight =>
        Some(Rectangle(x + 1, y + 1, third * 2, height - 2))
      case cards.Standard  =>
        Some(Rectangle(x + 1, y + 1, width - 2, height * .4))
      case cards.Half =>
        Some(Rectangle(x + 1, y + 1, width - 2, height * .7))
      case cards.Third =>
        Some(Rectangle(x + 1, y + 1, width - 2, height * .4))
      case cards.FullMedia100 =>
        Some(Rectangle(x + 1, y + 1, width - 2, height * .6))
      case _ =>
        None
    }) map { rectDef =>
      <rect x={rectDef.x.toString}
            y={rectDef.y.toString}
            width={rectDef.width.toString}
            height={rectDef.height.toString}
            style="fill: #BBBBBB; stroke-width: 0"
        />
    }).toSeq
  }

  def drawColumn(column: Column, x: Double, y: Double, width: Double, height: Double) = {
    def box = <rect x={x.toString} y={y.toString} width={width.toString} height={height.toString} style={Style} />

    def image(itemClasses: ItemClasses) =
      drawImage(x, y, width, height, itemClasses)

    column match {
      case SingleItem(_, itemClasses) =>
        <g>
          {box}
          {image(itemClasses)}
        </g>


      case Rows(_, columns, rows, itemClasses) =>
        val rowWidth = width / columns.toDouble
        val rowHeight = height / rows.toDouble

        for {
          col <- 0 until columns
          row <- 0 until rows
        } yield {
          val left = x + col * rowWidth
          val top = y + row * rowHeight

          <g>
            <rect x={left.toString}
                  y={top.toString}
                  width={rowWidth.toString}
                  height={rowHeight.toString}
                  style={Style}/>
            {drawImage(left, top, rowWidth, rowHeight, itemClasses)}
          </g>
        }

      case _: MPU =>
        val centreX = x + width / 2
        val centreY = y + height / 2

        <g>
          {box}
          <text x={centreX.toString}
                y={centreY.toString}
                text-anchor="middle"
                style="font: 10px Arial, Verdana, sans-serif; alignment-baseline: central; fill: white;">MPU</text>
        </g>

      case SplitColumn(_, topItemClasses, bottomItemClasses) =>
        val centreY = y + height / 2

        <g>
          <rect x={x.toString}
                y={y.toString}
                width={width.toString}
                height={(height / 2).toString}
                style={Style} />
          {drawImage(x, y, width, height / 2, topItemClasses)}
          <rect x={x.toString}
                y={centreY.toString}
                width={width.toString}
                height={(height / 4).toString}
                style={Style} />
          {drawImage(x, centreY, width, height / 4, bottomItemClasses)}
          <rect x={x.toString}
                y={(centreY + height / 4).toString}
                width={width.toString}
                height={(height / 4).toString}
                style={Style} />
          {drawImage(x, centreY + height / 4, width, height / 4, bottomItemClasses)}
        </g>

    }
  }

  def fromId(id: String) = {
    val maybeSlices = id match {
      case "dynamic/fast" =>
        Some(Seq(HalfQuarterQl2Ql4))

      case "dynamic/slow" =>
        Some(Seq(HalfHl4))

      case _ =>
        FixedContainers.unapply(Some(id)).map(_.slices)
    }

    maybeSlices map { slices =>
      val yPositions = summing(slices)(sliceHeight)

      <svg xmlns="http://www.w3.org/2000/svg"
           xmlns:xlink="http://www.w3.org/1999/xlink"
           width={Width.toString}
           height={slices.map(sliceHeight).sum.toString}>
        {slices.zip(yPositions).map((drawSlice _).tupled)}
      </svg>
    }
  }
}
