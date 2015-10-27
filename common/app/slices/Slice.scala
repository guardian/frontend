package slices

import cards._
import layout._

sealed trait Slice {
  val layout: SliceLayout
}


/* .________.________.________.________.
 * |________|________|________|________|
 * |________|________|________|________|
 * |________|________|________|________|
 */
case object Ql3Ql3Ql3Ql3 extends Slice {
  val layout = SliceLayout(
    cssClassName = "q-ql-ql-ql",
    columns = Seq(
      Rows(
        colSpan = 4,
        columns = 4,
        rows = 3,
        ItemClasses(
          mobile = ListItem,
          tablet = ListItem
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
          mobile = MediaList,
          tablet = Standard
        )
      ),
      Rows(
        colSpan = 3,
        columns = 3,
        rows = 3,
        ItemClasses(
          mobile = ListItem,
          tablet = ListItem
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
          mobile = MediaList,
          tablet = Standard
        )
      ),
      SingleItem(
        1,
        ItemClasses(
          mobile = MediaList,
          tablet = Standard
        )
      ),
      Rows(
        colSpan = 2,
        columns = 2,
        rows = 3,
        ItemClasses(
          mobile = ListItem,
          tablet = ListItem
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
          mobile = MediaList,
          tablet = Standard
        )
      ),
      SingleItem(
        1,
        ItemClasses(
          mobile = MediaList,
          tablet = Standard
        )
      ),
      SingleItem(
        1,
        ItemClasses(
          mobile = MediaList,
          tablet = Standard
        )
      ),
      Rows(
        colSpan = 1,
        columns = 1,
        rows = 3,
        ItemClasses(
          mobile = ListItem,
          tablet = ListItem
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
            mobile = MediaList,
            tablet = Standard
          )
        ),
        SingleItem(
          1,
          ItemClasses(
            mobile = MediaList,
            tablet = Standard
          )
        ),
        SingleItem(
          1,
          ItemClasses(
            mobile = MediaList,
            tablet = Standard
          )
        ),
        SingleItem(
          1,
          ItemClasses(
            mobile = MediaList,
            tablet = Standard
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
    cssClassName = "h-ql4-ql4",
    columns = Seq(
      SingleItem(
        colSpan = 2,
        ItemClasses(
          mobile = MediaList,
          tablet = Half
        )
      ),
      Rows(
        colSpan = 2,
        columns = 2,
        rows = 4,
        ItemClasses(
          mobile = ListItem,
          tablet = ListItem
        )
      )
    )
  )
}

/* ._________________.________.________.
 * |#################|########|########|
 * |#################|########|########|
 * |#################|########|########|
 * |_________________|________|________|
 */
case object HalfQQ extends Slice {
  val layout = SliceLayout(
    cssClassName = "h-q-q",
    columns = Seq(
      SingleItem(
        colSpan = 2,
        ItemClasses(
          mobile = Standard,
          tablet = Half
        )
      ),
      SingleItem(
        colSpan = 1,
        ItemClasses(
          mobile = MediaList,
          tablet = Standard
        )
      ),
      SingleItem(
        colSpan = 1,
        ItemClasses(
          mobile = MediaList,
          tablet = Standard
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
case object HalfQuarterQl2Ql4 extends Slice {
  val layout = SliceLayout(
    cssClassName = "h-q_ql2-ql4",
    columns = Seq(
      SingleItem(
        colSpan = 2,
        itemClasses = ItemClasses(
          mobile = Standard,
          tablet = Half
        )
      ),
      SplitColumn(
        colSpan = 1,
        topItemRows = 1,
        topItemClasses = ItemClasses(
          mobile = MediaList,
          tablet = Standard
        ),
        bottomItemRows = 2,
        bottomItemsClasses = ItemClasses(
          mobile = ListItem,
          tablet = ListItem
        )
      ),
      Rows(
        colSpan = 1,
        columns = 1,
        rows = 5,
        itemClasses = ItemClasses(
          mobile = ListItem,
          tablet = ListItem
        )
      )
    )
  )
}

/** Basically the same as above but for when there is another slice above that has already degraded from a standard to
  * a media list item. Editorial have asked that the first item in this slice then gets the media list behaviour as
  * opposed to being a standard item at mobile.
  */
case object HalfQuarterQl2Ql4B extends Slice {
  private val master = HalfQuarterQl2Ql4.layout

  val layout = master.copy(columns = master.columns match {
    case SingleItem(colSpan, itemClasses) +: t =>
      SingleItem(colSpan, itemClasses.copy(mobile = MediaList)) +: t
  })
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
          mobile = ListItem,
          tablet = MediaList
        )
      )
    )
  )
}

/* .________.________._________________.
 * |########|########|                 |
 * |########|########|_________________|
 * |        |        |_________________|
 * |________|________|_________________|
 */
case object QuarterQuarterHl3 extends Slice {
  val layout = SliceLayout(
    cssClassName = "q-q-hl3",
    columns = Seq(
      SingleItem(
        colSpan = 1,
        ItemClasses(
          mobile = MediaList,
          tablet = Standard
        )
      ),
      SingleItem(
        colSpan = 1,
        ItemClasses(
          mobile = MediaList,
          tablet = Standard
        )
      ),
      Rows(
        colSpan = 2,
        columns = 1,
        rows = 3,
        ItemClasses(
          mobile = ListItem,
          tablet = MediaList
        )
      )
    )
  )
}

/* .________.________._________________.
 * |                 |########|########|
 * |_________________|########|########|
 * |_________________|        |        |
 * |_________________|________|________|
 */
case object Hl3QuarterQuarter extends Slice {
  val layout = SliceLayout(
    cssClassName = "hl3-q-q",
    columns = Seq(
      Rows(
        colSpan = 2,
        columns = 1,
        rows = 3,
        ItemClasses(
          mobile = ListItem,
          tablet = MediaList
        )
      ),
      SingleItem(
        colSpan = 1,
        ItemClasses(
          mobile = MediaList,
          tablet = Standard
        )
      ),
      SingleItem(
        colSpan = 1,
        ItemClasses(
          mobile = MediaList,
          tablet = Standard
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

/*
* The order of this sequence is important.
* We use flex-direction(row-reverse) to maintain DOM hierarchy whilst having correct visual ordering.
* */
case object Hl4QuarterQuarter extends Slice {
  val layout = SliceLayout(
    cssClassName = "h14-q-q",
    columns = Seq(
      Rows(
        colSpan = 2,
        columns = 2,
        rows = 1,
        ItemClasses(
          mobile = MediaList,
          tablet = Standard
        )
      ),
      Rows(
        colSpan = 2,
        columns = 1,
        rows = 4,
        ItemClasses(
          mobile = ListItem,
          tablet = MediaList
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
/*
* The order of this sequence is important.
* We use flex-direction(row-reverse) to maintain DOM hierarchy whilst having correct visual ordering.
* */
case object Hl4Half extends Slice {
  val layout = SliceLayout(
    cssClassName = "hl4-h",
    columns = Seq(
      SingleItem(
        colSpan = 1,
        ItemClasses(
          mobile = Standard,
          tablet = Half
        )
      ),
      Rows(
        colSpan = 1,
        columns = 1,
        rows = 4,
        ItemClasses(
          mobile = MediaList,
          tablet = MediaList
        )
      )
    )
  )
}

/* ._________________._________________.
 * |_###_____________|                 |
 * |_###_____________|     MPU         |
 * |_###_____________|_________________|
 */
/*
* The order of this sequence is important.
* We use flex-direction(row-reverse) to maintain DOM hierarchy whilst having correct visual ordering.
* */
case object Hl3Mpu extends Slice {
  val layout = SliceLayout(
    cssClassName = "hl3-mpu",
    columns = Seq(
      Rows(
        colSpan = 1,
        columns = 1,
        rows = 3,
        ItemClasses(
          mobile = MediaList,
          tablet = MediaList
        )
      ),
      MPU(
        colSpan = 1
      )
    )
  )
}

/** This is not actually used but is a reflection of Hl4Half, for the thumbnail display in the tool */
object HalfHl4 extends Slice {
  val layout = Hl4Half.layout.copy(
    columns = Hl4Half.layout.columns.reverse
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
    cssClassName = "qqq-q",
    columns = Seq(
      SingleItem(
        colSpan = 3,
        ItemClasses(
          mobile = Standard,
          tablet = ThreeQuarters
        )
      ),
      SingleItem(
        colSpan = 1,
        ItemClasses(
          mobile = MediaList,
          tablet = Standard
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
    cssClassName = "q-qqq",
    columns = Seq(
      SingleItem(
        colSpan = 1,
        ItemClasses(
          mobile = MediaList,
          tablet = Standard
        )
      ),
      SingleItem(
        colSpan = 3,
        ItemClasses(
          mobile = Standard,
          tablet = ThreeQuartersRight
        )
      )
    )
  )
}

/* .__________________________.________.
 * |##########################|########|
 * |##########################|########|
 * |##########################|        |
 * |##########################|        |
 * |##########################|        |
 * |##########################|--------|
 * |##########################|########|
 * |##########################|########|
 * |                          |        |
 * |                          |        |
 * |                          |        |
 * `--------------------------'--------'
 */
case object ThreeQuarterTallQuarter2 extends Slice {
  val layout = SliceLayout(
    cssClassName = "qqqtall-q2",
    columns = Seq(
      SingleItem(
        colSpan = 3,
        ItemClasses(
          mobile = Standard,
          tablet = ThreeQuartersTall
        )
      ),
      Rows(
        colSpan = 1,
        columns = 1,
        rows = 2,
        ItemClasses(
          mobile = ListItem,
          tablet = Standard
        )
      )
    )
  )
}

/* .__________________________.________.
 * |##########################|########|
 * |##########################|        |
 * |##########################|        |
 * |##########################|--------|
 * |##########################|########|
 * |##########################|        |
 * |##########################|        |
 * |##########################|--------|
 * |                          |        |
 * |                          |--------|
 * |                          |        |
 * `--------------------------'--------'
 */
case object ThreeQuarterTallQuarter2Ql2 extends Slice {
  val layout = SliceLayout(
    cssClassName = "qqqtall-q2-ql2",
    columns = Seq(
      SingleItem(
        colSpan = 3,
        ItemClasses(
          mobile = Standard,
          tablet = ThreeQuartersTall
        )
      ),
      SplitColumn(
        colSpan = 1,
        topItemRows = 2,
        topItemClasses = ItemClasses(
          mobile = ListItem,
          tablet = Standard
        ),
        bottomItemRows = 2,
        bottomItemsClasses = ItemClasses(
          mobile = ListItem,
          tablet = ListItem
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
          mobile = Standard,
          tablet = Half
        )
      ),
      SingleItem(
        colSpan = 1,
        ItemClasses(
          mobile = Standard,
          tablet = Half
        )
      )
    )
  )
}

/** Same as above, but doesn't give two large standard items on mobile view. Good for when you just need a container
  * that supports two items, but you don't want it to be given an extreme treatment on mobile, i.e., in the story
  * package and on tag page containers.
  */
case object HalfHalf2 extends Slice {
  val layout = SliceLayout(
    cssClassName = "h-h",
    columns = Seq(
      SingleItem(
        colSpan = 1,
        ItemClasses(
          mobile = Standard,
          tablet = Half
        )
      ),
      SingleItem(
        colSpan = 1,
        ItemClasses(
          mobile = MediaList,
          tablet = Half
        )
      )
    )
  )
}

/* .___________________________________.
 * |                  #################|
 * |                  #################|
 * |                  #################|
 * |                  #################|
 * |                  #################|
 * `-----------------------------------'
 */
case object FullMedia50 extends Slice {
  val layout = SliceLayout(
    cssClassName = "f",
    columns = Seq(
      SingleItem(
        colSpan = 1,
        ItemClasses(
          mobile = MediaList,
          tablet = cards.FullMedia50
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
case object FullMedia75 extends Slice {
  val layout = SliceLayout(
    cssClassName = "f",
    columns = Seq(
      SingleItem(
        colSpan = 1,
        ItemClasses(
          mobile = Standard,
          tablet = cards.FullMedia75
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
case object FullMedia100 extends Slice {
  val layout = SliceLayout(
    cssClassName = "mf",
    columns = Seq(
      SingleItem(
        colSpan = 1,
        ItemClasses(
          mobile = Standard,
          tablet = cards.FullMedia100
        )
      )
    )
  )
}

/*   .___________________________________.
 * ##|###################################|##
 * ##|###################################|##
 * ##|###################################|##
 *   |                                   |
 *   `-----------------------------------'
 */
case object Fluid extends Slice {
  val layout = SliceLayout(
    cssClassName = "mf",
    columns = Seq(
      SingleItem(
        colSpan = 1,
        ItemClasses(
          mobile = cards.Fluid,
          tablet = cards.Fluid
        )
      )
    )
  )
}


/*** LIST SLICES ***/

/* .___________.___________.___________.
 * |___________|___________|           |
 * |___________|___________|   MPU!    |
 * |___________|___________|___________|
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
          mobile = ListItem,
          tablet = ListItem
        )
      ),
      MPU(
        colSpan = 1
      )
    )
  )
}

/* .________.________.________.________.
 * |________|________|________|________|
 */
case object Ql1Ql1Ql1Ql1 extends Slice {
  val layout: SliceLayout = SliceLayout(
    cssClassName = "ql-ql-ql-ql",
    columns = Seq(
      Rows(
        colSpan = 4,
        columns = 4,
        rows = 1,
        ItemClasses(
          mobile = ListItem,
          tablet = ListItem
        )
      )
    )
  )
}

/* .________.________.________.________.
 * |________|________|________|________|
 * |________|________|________|________|
 */
case object Ql2Ql2Ql2Ql2 extends Slice {
  val layout: SliceLayout = SliceLayout(
    cssClassName = "ql-ql-ql-ql",
    columns = Seq(
      Rows(
        colSpan = 4,
        columns = 4,
        rows = 2,
        ItemClasses(
          mobile = ListItem,
          tablet = ListItem
        )
      )
    )
  )
}

/* .___________.___________.___________.
 * |___________|___________|___________|
 * |___________|___________|___________|
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
          mobile = ListItem,
          tablet = ListItem
        )
      )
    )
  )
}

/* .___________.___________.___________.
 * |_#########_|_#########_|_#########_|
 * |_#########_|_#########_|_#########_|
 * |_#########_|_#########_|_#########_|
 * |           |           |           |
 * |           |           |           |
 * `-----------------------------------'
 */
case object TTT extends Slice {
  val layout = SliceLayout(
    cssClassName = "t-t-t",
    columns = Seq(
      SingleItem(
        colSpan = 1,
        ItemClasses(
          mobile = Standard,
          tablet = Third
        )
      ),
      SingleItem(
        colSpan = 1,
        ItemClasses(
          mobile = MediaList,
          tablet = Third
        )
      ),
      SingleItem(
        colSpan = 1,
        ItemClasses(
          mobile = MediaList,
          tablet = Third
        )
      )
    )
  )
}

/* .___________.___________.___________.
 * |_#########_|_#########_|___________|
 * |_#########_|_#########_|___________|
 * |_#########_|_#########_|___________|
 * |           |           |___________|
 * |           |           |___________|
 * `-----------------------------------'
 */
case object TTTL4 extends Slice {
  val layout = SliceLayout(
    cssClassName = "t-t-tl4",
    columns = Seq(
      SingleItem(
        colSpan = 1,
        ItemClasses(
          mobile = Standard,
          tablet = Third
        )
      ),
      SingleItem(
        colSpan = 1,
        ItemClasses(
          mobile = MediaList,
          tablet = Third
        )
      ),
      Rows(
        colSpan = 1,
        columns = 1,
        rows = 3,
        ItemClasses(
          mobile = ListItem,
          tablet = ListItem
        )
      )
    )
  )
}

/* .___________.___________.___________.
 * |_#########_|___________|           |
 * |_#########_|___________|    MPU!   |
 * |_#########_|___________|           |
 * |           |___________|           |
 * |           |___________|           |
 * `-----------------------------------'
 */
case object TTlMpu extends Slice {
  val layout = SliceLayout(
    cssClassName = "t-tl-mpu",
    columns = Seq(
      SingleItem(
        colSpan = 1,
        ItemClasses(
          mobile = MediaList,
          tablet = Third
        )
      ),
      Rows(
        colSpan = 1,
        columns = 1,
        rows = 3,
        ItemClasses(
          mobile = ListItem,
          tablet = ListItem
        )
      ),
      MPU(
        colSpan = 1
      )
    )
  )
}

case object TTMpu extends Slice {
  val layout = SliceLayout(
    cssClassName = "t-t-mpu",
    columns = Seq(
      SingleItem(
        colSpan = 1,
        ItemClasses(
          mobile = MediaList,
          tablet = Third
        )
      ),
      SingleItem(
        colSpan = 1,
        ItemClasses(
          mobile = MediaList,
          tablet = Third
        )
      ),
      MPU(
        colSpan = 1
      )
    )
  )
}
