package slices

object DynamicPackage extends DynamicContainer {
  override protected def standardSlice(stories: Seq[Story]): Option[Slice] = {
    val BigsAndStandards(bigs, _) = bigsAndStandards(stories)

    if (stories.isEmpty) {
      None
    } else {
      Some(if (stories.length == 1) {
        FullMedia75
      } else if (stories.length == 2) {
        ThreeQuarterTallQuarter
      } else if (stories.length == 3) {
        ThreeQuarterTallQuarter2
      } else {
        ThreeQuarterTallQuarter2Ql2
      })
    }
  }
}
