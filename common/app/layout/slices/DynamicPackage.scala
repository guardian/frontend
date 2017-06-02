package layout.slices

import layout.slices.Story._

object DynamicPackage extends DynamicContainer {
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
    val BigsAndStandards(_, _) = bigsAndStandards(stories)

    if (stories.isEmpty) {
      Nil
    } else {
      if (stories.length == 1) {
        Seq(FullMedia75)
      } else if (stories.length == 2) {
        Seq(ThreeQuarterQuarter)
      } else if (stories.length == 3) {
        Seq(ThreeQuarterTallQuarter2)
      } else if (stories.length == 4) {
        Seq(ThreeQuarterTallQuarter2Ql2)
      } else {
        Seq(FullMedia75, QuarterQuarterQuarterQuarter)
      }
    }
  }
}
