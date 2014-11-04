package layout

import cards._
import model.Trail

object InclusiveRange {
  def unit(n: Int) = InclusiveRange(n, n)

  def fromZero(n: Int) = InclusiveRange(0, n)

  def constrain(range: InclusiveRange, n: Int) =
    (n max range.minimum) min range.maximum
}

case class InclusiveRange(minimum: Int, maximum: Int)

/** The item class determines how many sublinks it has space to display. */
object Sublinks {
  import InclusiveRange.{unit, fromZero}

  val Default = unit(0)

  val byItemType: Map[CardType, InclusiveRange] = Map(
    (Full, fromZero(4)),
    (Half, fromZero(3)),
    (ListItem, unit(0)),
    (MediaList, unit(0)),
    (MegaFull, InclusiveRange(2, 4)),
    (Standard, fromZero(2)),
    (ThreeQuarters, fromZero(3)),
    (ThreeQuartersRight, fromZero(3))
  )

  def fromItemClasses(itemClasses: ItemClasses) =
    byItemType.getOrElse(itemClasses.tablet, Default)

  def takeSublinks(supporting: Seq[Trail], itemClasses: ItemClasses) = {
    val InclusiveRange(min, max) = fromItemClasses(itemClasses)

    val numberSupporting = supporting.length

    if (numberSupporting < min) {
      Nil
    } else {
      supporting.take(max)
    }
  }

  def numberOfSublinks(trail: Trail, itemClasses: ItemClasses) =
    takeSublinks(trail.supporting, itemClasses).length
}
