package layout.slices

object DynamicSlow extends DynamicContainer {
  override protected def standardSlices(stories: Seq[Story], firstSlice: Option[Slice]): Seq[Slice] = {
    val BigsAndStandards(bigs, _) = bigsAndStandards(stories)

    if (stories.isEmpty) {
      Nil
    } else {
      Seq(if (bigs.isEmpty) {
        Hl4Hl4
      } else if (bigs.length == 1) {
        Hl4Half
      } else {
        Hl4QuarterQuarter
      })
    }
  }
}
