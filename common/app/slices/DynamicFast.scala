package slices

object DynamicFast extends DynamicContainer {
  protected def standardSlice(stories: Seq[Story]): Option[Slice] = {
    val isFirstBoosted = stories.headOption.exists(_.isBoosted)

    val BigsAndStandards(bigs, _) = bigsAndStandards(stories)

    if (stories.isEmpty) {
      None
    } else {
      Some(
        if (stories.forall(_.group == 0)) {
          Ql3Ql3Ql3Ql3
        } else if (isFirstBoosted) {
          bigs.length match {
            case 1 => HalfQl4Ql4
            case _ => HalfQuarterQl2Ql3
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
