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

  def fromItemClasses(itemClasses: ItemClasses) = itemClasses.tablet match {
    case FullMedia50 | FullMedia75 => fromZero(4)
    case Half => fromZero(3)
    case ListItem | MediaList | Fluid => unit(0)
    case FullMedia100 => InclusiveRange(2, 4)
    case Standard | Third => fromZero(2)
    case ThreeQuarters | ThreeQuartersRight => fromZero(3)
  }

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
