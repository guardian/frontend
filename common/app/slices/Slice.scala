package slices

import layout._
import model.Collection

sealed trait Slice {
  /** TODO: once we get rid of all the not-implementeds below, turn this into a val */
  def layout: SliceLayout
}

object Slice {
  def apply(collection: Collection, slice: Slice) = {
    val cards = collection.items.zipWithIndex.map{case (trail, index) => Card(index, trail)}
    SliceWithCards.fromItems(cards, slice.layout)
  }
}

/* .________.________.________.________.
* |________|________|________|________|
* |________|________|________|________|
* |________|________|________|________|
*/
case object QlQlQlQl extends Slice {
  def layout = ???
}

/* .________.________.________.________.
* |########|________|________|________|
* |########|________|________|________|
* |________|________|________|________|
*/
case object QuarterQlQlQl extends Slice {
  def layout = ???
}

/* .________.________.________.________.
 * |########|########|________|________|
 * |########|########|________|________|
 * |________|________|________|________|
 */
case object QuarterQuarterQlQl extends Slice {
  def layout = ???
}

/* .________.________.________.________.
 * |########|########|########|________|
 * |########|########|########|________|
 * |________|________|________|________|
 */
case object QuarterQuarterQuarterQl extends Slice {
  def layout = ???
}

/* .________.________.________.________.
 * |########|########|########|########|
 * |########|########|########|########|
 * |________|________|________|________|
 */
case object QuarterQuarterQuarterQuarter extends Slice {
    val layout = SliceLayout(
      cssClassName = "q-q-q-q",
      columns = Seq(
        SingleItem(
          1,
          ItemClasses(
            mobile = "list-media",
            desktop = "standard-quarter"
          )
        ),
        SingleItem(
          1,
          ItemClasses(
            mobile = "list-media",
            desktop = "standard-quarter"
          )
        ),
        SingleItem(
          1,
          ItemClasses(
            mobile = "list-media",
            desktop = "standard-quarter"
          )
        ),
        SingleItem(
          1,
          ItemClasses(
            mobile = "list-media",
            desktop = "standard-quarter"
          )
        )
      )
    )
}

/* ._________________.________.________.
 * |#################|________|________|
 * |#################|________|________|
 * |#################|________|________|
 * |_________________|________|________|
 */
case object HalfQl4Ql4 extends Slice {
  def layout = ???
}

/* .________.________.________.________.
 * |#################|########|________|
 * |#################|________|________|
 * |#################|________|________|
 * |_________________|________|________|
 */
case object HalfQuarterQl2Ql3 extends Slice {
  def layout = ???
}

/* ._________________._________________.
 * |_________________|_________________|
 * |_________________|_________________|
 * |_________________|_________________|
 * |_________________|_________________|
 */
case object Hl4Hl4 extends Slice {
  def layout = ???
}

/* ._________________.________.________.
 * |_________________|########|########|
 * |_________________|########|########|
 * |_________________|        |        |
 * |_________________|________|________|
 */
case object Hl4QuarterQuarter extends Slice {
  def layout = ???
}

/* ._________________._________________.
 * |_________________|#################|
 * |_________________|#################|
 * |_________________|#################|
 * |_________________|_________________|
 */
case object Hl4Half extends Slice {
  def layout = ???
}


/*** VOLUME SLICES ***/

/* .__________________________.________.
 * |        ##################|########|
 * |        ##################|########|
 * |        ##################|########|
 * |        ##################|        |
 * `--------------------------'--------'
 */
case object ThreeQuarterQuarter extends Slice {
  def layout = ???
}

/* .________.__________________________.
 * |########|##################        |
 * |########|##################        |
 * |########|##################        |
 * |        |##################        |
 * `--------'--------------------------'
 */
case object QuarterThreeQuarter extends Slice {
  def layout = ???
}

/* ._________________._________________.
 * |#################|#################|
 * |#################|#################|
 * |#################|#################|
 * |                 |                 |
 * `-----------------'-----------------'
 */
case object HalfHalf extends Slice {
  def layout = ???
}

/* .___________________________________.
 * |         ##########################|
 * |         ##########################|
 * |         ##########################|
 * |         ##########################|
 * `-----------------------------------'
 */
case object FullThreeQuarterImage extends Slice {
  val layout = SliceLayout(
    cssClassName = "full-three-quarter",
    columns = Seq(
      SingleItem(
        flexWidth = 1,
        ItemClasses(
          mobile = "standard",
          desktop = "full-three-quarter"
        )
      )
    )
  )
}

/* .___________________________________.
 * |###################################|
 * |###################################|
 * |###################################|
 * |                                   |
 * `-----------------------------------'
 */
case object Full extends Slice {
  val layout = SliceLayout(
    cssClassName = "full",
    columns = Seq(
      SingleItem(
        flexWidth = 1,
        ItemClasses(
          mobile = "standard",
          desktop = "full"
        )
      )
    )
  )
}


/*** LIST SLICES ***/

/* .___________.___________.___________.
 * |_##________|_##________|           |
 * |_##________|_##________|   MPU!    |
 * |_##________|_##________|___________|
 */
case object TlTlMpu extends Slice {
  val layout = SliceLayout(
    cssClassName = "tl-tl-mpu",
    columns = Seq(
      Rows(
        flexWidth = 2,
        columns = 2,
        rows = 3,
        ItemClasses(
          mobile = "list",
          desktop = "media-list"
        )
      ),
      MPU(
        flexWidth = 1
      )
    )
  )
}

/* .___________.___________.___________.
 * |_##________|_##________|_##________|
 * |_##________|_##________|_##________|
 */
case object TlTlTl extends Slice {
  val layout = SliceLayout(
    cssClassName = "tl-tl-tl",
    columns = Seq(
      Rows(
        flexWidth = 1,
        columns = 3,
        rows = 2,
        ItemClasses(
          mobile = "list",
          desktop = "list"
        )
      )
    )
  )
}
