package slices

import layout._

sealed trait Slice {
  /** TODO: once we get rid of all the not-implementeds below, turn this into a val */
  def layout: SliceLayout
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
          mobile = "list",
          tablet = "list"
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
          tablet = "standard-quarter"
        )
      ),
      Rows(
        colSpan = 3,
        columns = 3,
        rows = 3,
        ItemClasses(
          mobile = "list",
          tablet = "list"
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
          tablet = "standard-quarter"
        )
      ),
      SingleItem(
        1,
        ItemClasses(
          mobile = "list-media-large",
          tablet = "standard-quarter"
        )
      ),
      Rows(
        colSpan = 2,
        columns = 2,
        rows = 3,
        ItemClasses(
          mobile = "list",
          tablet = "list"
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
          tablet = "standard-quarter"
        )
      ),
      SingleItem(
        1,
        ItemClasses(
          mobile = "list-media",
          tablet = "standard-quarter"
        )
      ),
      SingleItem(
        1,
        ItemClasses(
          mobile = "list-media",
          tablet = "standard-quarter"
        )
      ),
      Rows(
        colSpan = 1,
        columns = 1,
        rows = 3,
        ItemClasses(
          mobile = "list",
          tablet = "list"
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
            mobile = "list-media-large",
            tablet = "standard-quarter"
          )
        ),
        SingleItem(
          1,
          ItemClasses(
            mobile = "list-media-large",
            tablet = "standard-quarter"
          )
        ),
        SingleItem(
          1,
          ItemClasses(
            mobile = "list-media-large",
            tablet = "standard-quarter"
          )
        ),
        SingleItem(
          1,
          ItemClasses(
            mobile = "list-media-large",
            tablet = "standard-quarter"
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
          mobile = "list-media",
          tablet = "half"
        )
      ),
      Rows(
        colSpan = 2,
        columns = 2,
        rows = 4,
        ItemClasses(
          mobile = "list",
          tablet = "list"
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
          mobile = "standard",
          tablet = "half"
        )
      ),
      SingleItem(
        colSpan = 1,
        ItemClasses(
          mobile = "list-media",
          tablet = "standard"
        )
      ),
      SingleItem(
        colSpan = 1,
        ItemClasses(
          mobile = "list-media",
          tablet = "standard"
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
  def layout = SliceLayout(
    cssClassName = "h-q_ql2-ql4",
    columns = Seq(
      SingleItem(
        colSpan = 2,
        itemClasses = ItemClasses(
          mobile = "standard",
          tablet = "half"
        )
      ),
      SplitColumn(
        colSpan = 1,
        topItemClasses = ItemClasses(
          mobile = "list-media",
          tablet = "standard"
        ),
        bottomItemsClasses = ItemClasses(
          mobile = "list",
          tablet = "list"
        )
      ),
      Rows(
        colSpan = 1,
        columns = 1,
        rows = 4,
        itemClasses = ItemClasses(
          mobile = "list",
          tablet = "list"
        )
      )
    )
  )
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
          tablet = "list-media"
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
          mobile = "list-media",
          tablet = "standard"
        )
      ),
      SingleItem(
        colSpan = 1,
        ItemClasses(
          mobile = "list-media",
          tablet = "standard"
        )
      ),
      Rows(
        colSpan = 2,
        columns = 1,
        rows = 3,
        ItemClasses(
          mobile = "list",
          tablet = "list-media"
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
          mobile = "list-media",
          tablet = "standard"
        )
      ),
      Rows(
        colSpan = 2,
        columns = 1,
        rows = 4,
        ItemClasses(
          mobile = "list",
          tablet = "list-media"
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
          mobile = "standard",
          tablet = "half"
        )
      ),
      Rows(
        colSpan = 1,
        columns = 1,
        rows = 4,
        ItemClasses(
          mobile = "list-media",
          tablet = "list-media"
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
    cssClassName = "qqq-q",
    columns = Seq(
      SingleItem(
        colSpan = 3,
        ItemClasses(
          mobile = "standard",
          tablet = "three-quarters"
        )
      ),
      SingleItem(
        colSpan = 1,
        ItemClasses(
          mobile = "list-media-large",
          tablet = "standard"
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
          mobile = "list-media-large",
          tablet = "standard"
        )
      ),
      SingleItem(
        colSpan = 3,
        ItemClasses(
          mobile = "standard",
          tablet = "three-quarters-right"
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
          tablet = "half"
        )
      ),
      SingleItem(
        colSpan = 1,
        ItemClasses(
          mobile = "standard",
          tablet = "half"
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
case object Full extends Slice {
  val layout = SliceLayout(
    cssClassName = "f",
    columns = Seq(
      SingleItem(
        colSpan = 1,
        ItemClasses(
          mobile = "standard",
          tablet = "full"
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
case object MegaFull extends Slice {
  val layout = SliceLayout(
    cssClassName = "mf",
    columns = Seq(
      SingleItem(
        colSpan = 1,
        ItemClasses(
          mobile = "standard",
          tablet = "mega-full"
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
          mobile = "list",
          tablet = "list-compact"
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
          mobile = "list",
          tablet = "list"
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
          mobile = "list",
          tablet = "list-compact"
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
          mobile = "standard",
          tablet = "standard"
        )
      ),
      SingleItem(
        colSpan = 1,
        ItemClasses(
          mobile = "list-media",
          tablet = "standard"
        )
      ),
      SingleItem(
        colSpan = 1,
        ItemClasses(
          mobile = "list-media",
          tablet = "standard"
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
          mobile = "standard",
          tablet = "standard"
        )
      ),
      SingleItem(
        colSpan = 1,
        ItemClasses(
          mobile = "list-media-large",
          tablet = "standard"
        )
      ),
      Rows(
        colSpan = 1,
        columns = 1,
        rows = 4,
        ItemClasses(
          mobile = "list",
          tablet = "list"
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
          mobile = "list-media-large",
          tablet = "third"
        )
      ),
      Rows(
        colSpan = 1,
        columns = 1,
        rows = 3,
        ItemClasses(
          mobile = "list",
          tablet = "list"
        )
      ),
      MPU(
        colSpan = 1
      )
    )
  )
}
