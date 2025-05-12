package layout.slices

case class DynamicSlowMPU(adFree: Boolean) extends DynamicContainer {
  override protected def optionalFirstSlice(stories: Seq[Story]): Option[(Slice, Seq[Story])] = {
    val BigsAndStandards(bigs, _) = bigsAndStandards(stories)
    val isFirstBoosted = stories.headOption.exists(_.isBoosted)
    val isSecondBoosted = stories.lift(1).exists(_.isBoosted)

    if (bigs.length == 3) {
      Some((HalfQQ, stories.drop(3)))
    } else if (bigs.length == 2) {
      Some(
        if (isFirstBoosted) ThreeQuarterQuarter else if (isSecondBoosted) QuarterThreeQuarter else HalfHalf,
        stories.drop(2),
      )
    } else if (bigs.length == 1) {
      Some(if (isFirstBoosted) ThreeQuarterQuarter else HalfHalf, stories.drop(2))
    } else if (bigs.isEmpty) {
      None
    } else {
      Some(QuarterQuarterQuarterQuarter, stories.drop(4))
    }
  }

  override protected def standardSlices(stories: Seq[Story], firstSlice: Option[Slice]): Seq[Slice] =
    firstSlice match {
      case Some(_) if adFree =>
        if (stories.size > 3) Seq(Hl3QuarterQuarter) else Seq(TlTlTl)
      case Some(_) => Seq(Hl3Mpu)
      case None if adFree =>
        if (stories.size > 3) Seq(QuarterQuarterQuarterQuarter) else Seq(HalfHalf)
      case None => Seq(TTlMpu)
    }
}
