package layout

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

  val byClass = Map(
    ("full", fromZero(4)),
    ("half", fromZero(3)),
    ("list", unit(0)),
    ("list-media", unit(0)),
    ("mega-full", InclusiveRange(2, 4)),
    ("standard", fromZero(2)),
    ("three-quarters", fromZero(3)),
    ("three-quarters-right", fromZero(3))
  )

  def fromItemClasses(itemClasses: ItemClasses) =
    byClass.getOrElse(itemClasses.tablet, Default)

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
