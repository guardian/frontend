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
          Mothra
        } else if (isFirstBoosted) {
          bigs.length match {
            case 1 => Ghidorah
            case _ => Anguirus
          }
        } else {
          bigs.length match {
            case 1 => Reptilicus
            case 2 => Gappa
            case 3 => Daimajin
            case _ => Ultraman
          }
        }
      )
    }
  }
}
