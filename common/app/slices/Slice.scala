package slices

import layout._
import model.{Collection, Trail}
import views.support.TemplateDeduping

sealed trait Slice {
  /** TODO: once we get rid of all the not-implementeds below, turn this into a val */
  def layout: SliceLayout

  def apply(items: Seq[Trail])(implicit templateDeduping: TemplateDeduping): (SliceWithCards, Seq[Card]) = {
    val numItems = layout.columns.map(_.numItems).sum
    val dedupedItems = (templateDeduping(items.take(numItems)) ++ items).distinct
    val cards = dedupedItems.zipWithIndex.map{case (trail, index) => Card(index, trail)}

    SliceWithCards.fromItems(cards, layout)
  }

  def apply(collection: Collection)(implicit templateDeduping: TemplateDeduping): (SliceWithCards, Seq[Card]) = {
    this(collection.items)
  }
  
}


/* .________.________.________.________.
* |________|________|________|________|
* |________|________|________|________|
* |________|________|________|________|
*/
case object QlQlQlQl extends Slice {
  val layout = SliceLayout(
    cssClassName = "q-ql-ql-ql",
    columns = Seq(
      Rows(
        colSpan = 1,
        columns = 4,
        rows = 3,
        ItemClasses(
          mobile = "list",
          desktop = "list"
        )
      )
    )
  )
}

/* .________.________.________.________.
* |########|________|________|________|
* |########|________|________|________|
* |________|________|________|________|
*/
case object QuarterQlQlQl extends Slice {
  val layout = SliceLayout(
    cssClassName = "q-ql-ql-ql",
    columns = Seq(
      SingleItem(
        1,
        ItemClasses(
          mobile = "list-media-large",
          desktop = "standard-quarter"
        )
      ),
      Rows(
        colSpan = 3,
        columns = 3,
        rows = 3,
        ItemClasses(
          mobile = "list",
          desktop = "list"
        )
      )
    )
  )
}

/* .________.________.________.________.
 * |########|########|________|________|
 * |########|########|________|________|
 * |________|________|________|________|
 */
case object QuarterQuarterQlQl extends Slice {
  val layout = SliceLayout(
    cssClassName = "q-q-ql-ql",
    columns = Seq(
      SingleItem(
        1,
        ItemClasses(
          mobile = "list-media-large",
          desktop = "standard-quarter"
        )
      ),
      SingleItem(
        1,
        ItemClasses(
          mobile = "list-media-large",
          desktop = "standard-quarter"
        )
      ),
      Rows(
        colSpan = 2,
        columns = 2,
        rows = 3,
        ItemClasses(
          mobile = "list",
          desktop = "list"
        )
      )
    )
  )
}

/* .________.________.________.________.
 * |########|########|########|________|
 * |########|########|########|________|
 * |________|________|________|________|
 */
case object QuarterQuarterQuarterQl extends Slice {
  val layout = SliceLayout(
    cssClassName = "q-q-q-ql",
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
      Rows(
        colSpan = 1,
        columns = 1,
        rows = 3,
        ItemClasses(
          mobile = "list",
          desktop = "list"
        )
      )
    )
  )
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
  val layout = SliceLayout(
    cssClassName = "h-ql-ql",
    columns = Seq(
      SingleItem(
        colSpan = 2,
        ItemClasses(
          mobile = "standard",
          desktop = "half"
        )
      ),
      Rows(
        colSpan = 2,
        columns = 2,
        rows = 4,
        ItemClasses(
          mobile = "list",
          desktop = "list"
        )
      )
    )
  )
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
  val layout = SliceLayout(
    cssClassName = "hl-hl",
    columns = Seq(
      Rows(
        colSpan = 1,
        columns = 2,
        rows = 4,
        ItemClasses(
          mobile = "list",
          desktop = "list"
        )
      )
    )
  )
}

/* ._________________.________.________.
 * |_________________|########|########|
 * |_________________|########|########|
 * |_________________|        |        |
 * |_________________|________|________|
 */
case object Hl4QuarterQuarter extends Slice {
  val layout = SliceLayout(
    cssClassName = "hl-hl",
    columns = Seq(
      Rows(
        colSpan = 2,
        columns = 1,
        rows = 4,
        ItemClasses(
          mobile = "list",
          desktop = "list"
        )
      ),
      SingleItem(
        colSpan = 1,
        ItemClasses(
          mobile = "list-media",
          desktop = "standard"
        )
      ),
      SingleItem(
        colSpan = 1,
        ItemClasses(
          mobile = "list-media",
          desktop = "standard"
        )
      )
    )
  )
}

/* ._________________._________________.
 * |_###_____________|#################|
 * |_###_____________|#################|
 * |_###_____________|#################|
 * |_###_____________|_________________|
 */
case object Hl4Half extends Slice {
  val layout = SliceLayout(
    cssClassName = "hl-h",
    columns = Seq(
      Rows(
        colSpan = 1,
        columns = 2,
        rows = 4,
        ItemClasses(
          mobile = "list-media",
          desktop = "list-media"
        )
      ),
      SingleItem(
        colSpan = 1,
        ItemClasses(
          mobile = "standard",
          desktop = "half"
        )
      )
    )
  )
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
  val layout = SliceLayout(
    cssClassName = "t-q",
    columns = Seq(
      SingleItem(
        colSpan = 3,
        ItemClasses(
          mobile = "standard",
          desktop = "third"
        )
      ),
      SingleItem(
        colSpan = 1,
        ItemClasses(
          mobile = "list-media-large",
          desktop = "standard"
        )
      )
    )
  )
}

/* .________.__________________________.
 * |########|##################        |
 * |########|##################        |
 * |########|##################        |
 * |        |##################        |
 * `--------'--------------------------'
 */
case object QuarterThreeQuarter extends Slice {
  val layout = SliceLayout(
    cssClassName = "q-t",
    columns = Seq(
      SingleItem(
        colSpan = 1,
        ItemClasses(
          mobile = "list-media-large",
          desktop = "standard"
        )
      ),
      SingleItem(
        colSpan = 3,
        ItemClasses(
          mobile = "standard",
          desktop = "third"
        )
      )
    )
  )
}

/* ._________________._________________.
 * |#################|#################|
 * |#################|#################|
 * |#################|#################|
 * |                 |                 |
 * `-----------------'-----------------'
 */
case object HalfHalf extends Slice {
  val layout = SliceLayout(
    cssClassName = "h-h",
    columns = Seq(
      SingleItem(
        colSpan = 1,
        ItemClasses(
          mobile = "standard",
          desktop = "half"
        )
      ),
      SingleItem(
        colSpan = 3,
        ItemClasses(
          mobile = "standard",
          desktop = "half"
        )
      )
    )
  )
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
    cssClassName = "f",
    columns = Seq(
      SingleItem(
        colSpan = 1,
        ItemClasses(
          mobile = "standard",
          desktop = "full"
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
    cssClassName = "mf",
    columns = Seq(
      SingleItem(
        colSpan = 1,
        ItemClasses(
          mobile = "standard",
          desktop = "mega-full"
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
        colSpan = 2,
        columns = 2,
        rows = 3,
        ItemClasses(
          mobile = "list",
          desktop = "media-list"
        )
      ),
      MPU(
        colSpan = 1
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
        colSpan = 1,
        columns = 3,
        rows = 2,
        ItemClasses(
          mobile = "list",
          desktop = "list-media"
        )
      )
    )
  )
}
