package slices

object DynamicSlow extends DynamicContainer {
  override protected def standardSlices(stories: Seq[Story], firstSlice: Option[Slice]): Seq[Slice] = {
    val BigsAndStandards(bigs, _) = bigsAndStandards(stories)

    if (stories.isEmpty) {
      Nil
    } else {
      Seq(if (bigs.length == 0) {
        Hl4Hl4
      } else if (bigs.length == 1) {
        Hl4Half
      } else {
        Hl4QuarterQuarter
      })
    }
  }
}

object DynamicSlowMPU extends DynamicContainer {
  override protected def optionalFirstSlice(stories: Seq[Story]): Option[(Slice, Seq[Story])] = {
    val BigsAndStandards(bigs, _) = bigsAndStandards(stories)
    val isFirstBoosted = stories.headOption.exists(_.isBoosted)

    if (bigs.length == 3) {
      Some((HalfQQ, stories.drop(3)))
    } else if (bigs.length == 2) {
      Some((if (isFirstBoosted) ThreeQuarterQuarter else HalfHalf, stories.drop(2)))
    } else if (bigs.length == 1) {
      Some(if (isFirstBoosted) ThreeQuarterQuarter else HalfHalf, stories.drop(2))
    } else if (bigs.isEmpty) {
      None
    } else {
      Some(QuarterQuarterQuarterQuarter, stories.drop(4))
    }
  }

  override protected def standardSlices(stories: Seq[Story], firstSlice: Option[Slice]): Seq[Slice] = Seq(Hl3Mpu)
}
