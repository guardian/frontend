package layout.slices

import layout.slices.Story._

object DynamicElection extends DynamicContainer {

  override protected def optionalFirstSlice(stories: Seq[Story]): Option[(Slice, Seq[Story])] = {
    val byGroup = segmentByGroup(stories)
    val snap = byGroup.getOrElse(1, Seq.empty)

    if (snap.nonEmpty) {
      Some((FullMedia50, stories.drop(1)))
    } else {
      None
    }
  }

  override protected def standardSlices(stories: Seq[Story], firstSlice: Option[Slice]): Seq[Slice] = {
    // optinal snap (1) - 2 - 4
    stories.length match {
      case 0 => Nil
      case 1 => Nil
      case 2 => Seq(ThreeQuarterTallQuarter1)
      case 3 => Seq(ThreeQuarterTallQuarter1)
      case 4 => Seq(ThreeQuarterTallQuarter1)
      case 5 => Seq(ThreeQuarterTallQuarter1)
      case 6 => Seq(ThreeQuarterTallQuarter1, QuarterQuarterQuarterQuarter)
      case _ => Seq(ThreeQuarterTallQuarter1, QuarterQuarterQuarterQuarter)
    }
  }
}

