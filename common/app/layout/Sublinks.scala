package layout

import cards._
import implicits.FaciaContentFrontendHelpers.FaciaContentFrontendHelper
import model.pressed.PressedContent

/** The item class determines how many sublinks it has space to display. */
object Sublinks {
  import InclusiveRange.{unit, fromZero}

  val Default = unit(0)

  def fromItemClasses(itemClasses: ItemClasses): InclusiveRange =
    itemClasses.tablet match {
      case FullMedia50 | FullMedia75                              => fromZero(4)
      case Half                                                   => fromZero(3)
      case ListItem | MediaList | Fluid                           => unit(0)
      case FullMedia100                                           => InclusiveRange(2, 4)
      case Standard | Third                                       => fromZero(2)
      case ThreeQuarters | ThreeQuartersRight | ThreeQuartersTall => fromZero(3)
    }

  def takeSublinks(supporting: Seq[PressedContent], itemClasses: ItemClasses): Seq[PressedContent] = {
    val InclusiveRange(min, max) = fromItemClasses(itemClasses)

    val numberSupporting = supporting.length

    if (numberSupporting < min) {
      Nil
    } else {
      supporting.take(max)
    }
  }

  def numberOfSublinks(faciaContent: PressedContent, itemClasses: ItemClasses): Int =
    takeSublinks(faciaContent.supporting, itemClasses).length
}
