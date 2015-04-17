package slices

object DynamicFast extends DynamicContainer {
  protected def standardSlices(stories: Seq[Story]): Seq[Slice] = {
    val isFirstBoosted = stories.headOption.exists(_.isBoosted)

    val BigsAndStandards(bigs, _) = bigsAndStandards(stories)

    if (stories.isEmpty) {
      Nil
    } else {
      Seq(
        if (stories.forall(_.group == 0)) {
          Ql3Ql3Ql3Ql3
        } else if (isFirstBoosted) {
          bigs.length match {
            case 1 => HalfQl4Ql4
            case _ => HalfQuarterQl2Ql4
          }
        } else {
          bigs.length match {
            case 1 => QuarterQlQlQl
            case 2 => QuarterQuarterQlQl
            case 3 => QuarterQuarterQuarterQl
            case _ => QuarterQuarterQuarterQuarter
          }
        }
      )
    }
  }
}
